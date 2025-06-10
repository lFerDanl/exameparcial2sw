"use client";

import {
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useMyPresence,
  useSelf,
  useStorage,
} from "@liveblocks/react";
import {
  colorToCss,
  findIntersectionLayersWithRectangle,
  penPointsToPathPayer,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "~/utils";
import LayerComponent from "./LayerComponent";
import {
  Camera,
  CanvasMode,
  CanvasState,
  EllipseLayer,
  Layer,
  LayerType,
  Point,
  RectangleLayer,
  Side,
  TextLayer,
  XYWH,
  InputLayer,
  ButtonLayer,
  SelectorLayer,
  CheckboxLayer,
  DatePickerLayer,
  TimePickerLayer,
} from "~/types";
import { nanoid } from "nanoid";
import { LiveObject } from "@liveblocks/client";
import { useCallback, useEffect, useRef, useState } from "react";
import React from "react";
import ToolsBar from "../toolsbar/ToolsBar";
import ToolbarTop from "../toolsbar/ToolbarTop";
import Path from "./Path";
import SelectionBox from "./SelectionBox";
import useDeleteLayers from "~/hooks/useDeleteLayers";
import SelectionTools from "./SelectionTools";
import Sidebars from "../sidebars/Sidebars";
import MultiplayerGuides from "./MultiplayerGuides";
import { User } from "@prisma/client";
import { GoogleGenAI, createUserContent } from "@google/genai";


// Importar el hook para generar proyectos Angular
import { useAngularProjectGenerator } from "../angular-generator/useAngularProjectGenerator";
// Obtener la función para generar proyectos Flutter
import { useFlutterProjectGenerator } from "~/components/flutter-generator/useFlutterProjectGenerator";


//Importar el hook para generar copy&pase con teclado
import useCopyPaste from "~/hooks/useCopyPaste";

const MAX_LAYERS = 100;

// Add this function before the Canvas component
const createDesignPrompt = (promptText: string) => `
Eres un diseñador experto en UI. Genera un diseño en formato JSON para un lienzo de interfaz.
El layer que va representar el background debe ser de tamaño width 448 y height 950.

El JSON debe seguir esta estructura:
{
  "layers": {
    "[ID]": {
      "type": número, // 0: Rectángulo, 1: Elipse, 3: Texto, 4: Input, 5: Button, 6: Selector, 7: Checkbox, 8: DatePicker, 9: TimePicker
      "x": número,
      "y": número,
      "height": número,  // 20 para Checkbox
      "width": número,  // 20 para Checkbox
      "fill": {"r": 255, "g": 255, "b": 255},
      "stroke": {"r": 0, "g": 0, "b": 0},
      "opacity": 100,
      "cornerRadius": número, // opcional
      "text": "Texto", // para Text, Button
      "fontSize": 24, // opcional para Input, Button, Selector, Checkbox, DatePicker, TimePicker
      "fontFamily": "Arial", // opcional para Input, Button, Selector, Checkbox, DatePicker, TimePicker
      "textFill": {"r": 0, "g": 0, "b": 0}, // opcional para Input, Button, Selector, Checkbox, DatePicker, TimePicker
      "placeholder": "Placeholder", // opcional para Input, DatePicker, TimePicker
      "options": ["Option 1", "Option 2"], // para Selector
      "selectedOption": "Option 1", // opcional para Selector
      "checked": false, // para Checkbox
      "label": "Label", // para Checkbox
      "value": "2024-03-20", // opcional para DatePicker
      "format": "YYYY-MM-DD", // opcional para DatePicker, TimePicker
      "isBackground": boolean, // true para rectángulos que actúan como backgrounds/padres
      "parentId": "ID" // ID del layer padre (solo para hijos)
    }
  },
  "layerIds": ["id1", "id2"],
  "roomColor": {"r": 30, "g": 30, "b": 30}
}

Reglas para la jerarquía:
1. El primer rectángulo debe ser un background (isBackground: true)
2. Los elementos que estén dentro de un rectángulo background deben tener su parentId
3. Los rectángulos que no estén dentro de otro rectángulo deben ser backgrounds
4. Solo los rectángulos pueden ser backgrounds/padres
5. Los elementos hijos deben estar posicionados dentro de los límites de su padre

Hazlo con base en esta descripción: ${promptText}

Responde solo con el JSON, sin texto adicional.
`; 

export default function Canvas({
  roomName,
  roomId,
  othersWithAccessToRoom,
  searchParams,
}: {
  roomName: string;
  roomId: string;
  othersWithAccessToRoom: User[];
  searchParams?: { [key: string]: string | undefined }; // ✅ Agregado
}) {
  // Obtener la función para generar proyectos Angular
  const generateAngularProject = useAngularProjectGenerator(roomName);
  // Obtener la función para generar proyectos Flutter
  const generateFlutterProject = useFlutterProjectGenerator(roomName);


  //Hooks para el prompt 2do parcial
  const [prompt, setPrompt] = useState(""); // Para almacenar el texto del usuario
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false); // Para controlar el estado de carga

  // Obtener la funcion para copiar y pegar capas
  const { copyLayers, pasteLayers } = useCopyPaste();

  const [leftIsMinimized, setLeftIsMinimized] = useState(false);
  const [isProcessingSketch, setIsProcessingSketch] = useState(false);
  const roomColor = useStorage((root) => root.roomColor);
  const layerIds = useStorage((root) => root.layerIds);
  const pencilDraft = useSelf((me) => me.presence.pencilDraft);
  const deleteLayers = useDeleteLayers();
  const [canvasState, setState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sketchImageInputRef = useRef<HTMLInputElement>(null);

  const selectAllLayers = useMutation(
    ({ setMyPresence }) => {
      if (layerIds) {
        setMyPresence({ selection: [...layerIds] }, { addToHistory: true });
      }
    },
    [layerIds],
  );

  // Función para exportar el lienzo a JSON
  const exportToJSON = useMutation(
    ({ storage }) => {
      const layers = storage.get("layers").toImmutable();
      const layerIdsArray = storage.get("layerIds").toImmutable();
      const canvasColor = storage.get("roomColor");

      // Convertir el mapa de capas a un objeto para JSON
      const layersObject: Record<string, any> = {};
      const backgrounds: string[] = [];
      const childrenByParent: Record<string, string[]> = {};

      layers.forEach((layer, id) => {
        // Usar JSON.parse(JSON.stringify()) para obtener una copia mutable del objeto
        const layerData = JSON.parse(JSON.stringify(layer));
        layersObject[id] = layerData;

        // Si es un background, agregarlo a la lista de backgrounds
        if (layerData.type === LayerType.Rectangle && layerData.isBackground) {
          backgrounds.push(id);
        }

        // Si tiene un padre, agregarlo a la lista de hijos del padre
        const parentId = layerData.parentId;
        if (parentId && typeof parentId === 'string') {
          if (!childrenByParent[parentId]) {
            childrenByParent[parentId] = [];
          }
          childrenByParent[parentId].push(id);
        }
      });

      const canvasData = {
        layers: layersObject,
        layerIds: layerIdsArray,
        roomColor: canvasColor,
        exportedAt: new Date().toISOString(),
        name: roomName,
        hierarchy: {
          backgrounds,
          childrenByParent
        }
      };

      // Crear y descargar el archivo JSON
      const jsonString = JSON.stringify(canvasData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${roomName.replace(/\s+/g, "_")}_canvas_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [roomName],
  );

  // Función para importar desde JSON
  const importFromJSON = useMutation(
    ({ storage, setMyPresence }, jsonData: any) => {
      try {
        // Validar que el JSON tenga la estructura esperada
        if (!jsonData.layers || !jsonData.layerIds) {
          throw new Error("Invalid JSON format: missing layers or layerIds");
        }

        // Obtener referencias al almacenamiento
        const liveLayers = storage.get("layers");
        const liveLayerIds = storage.get("layerIds");

        // Limpiar el lienzo actual
        // Fix: Usar delete en lugar de pop para LiveList
        const currentLength = liveLayerIds.length;
        for (let i = currentLength - 1; i >= 0; i--) {
          liveLayerIds.delete(i);
        }

        // Limpiar todas las capas existentes
        const existingLayerIds = [...liveLayers.keys()];
        existingLayerIds.forEach((id) => {
          liveLayers.delete(id);
        });

        // Importar el color de la sala si existe
        if (jsonData.roomColor) {
          storage.set("roomColor", jsonData.roomColor);
        }

        // Importar las capas
        Object.entries(jsonData.layers).forEach(([id, layerData]) => {
          // Cast the layerData to Layer type to ensure type safety
          const typedLayerData = layerData as Layer;
          liveLayers.set(id, new LiveObject(typedLayerData));
        });

        // Importar los IDs de las capas en el orden correcto
        jsonData.layerIds.forEach((id: string, index: number) => {
          liveLayerIds.push(id);
        });

        // Deseleccionar todo
        setMyPresence({ selection: [] });

        // Restablecer el estado del lienzo
        setState({ mode: CanvasMode.None });
      } catch (error) {
        console.error("Error importing JSON:", error);
        alert("Error importing file. Please check the file format.");
      }
    },
    [],
  );

  // Manejador para la carga de archivos
  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          importFromJSON(jsonData);
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          alert("Invalid JSON file format");
        }
      };
      reader.readAsText(file);

      // Limpiar el input para permitir cargar el mismo archivo nuevamente
      event.target.value = "";
    },
    [importFromJSON],
  );

  // Función para procesar una imagen de boceto con Gemini AI
  const processSketchWithGemini = useMutation(
    async ({ storage }, file: File) => {
      try {
        setIsProcessingSketch(true);

        // Inicializar el cliente de Gemini AI
        const ai = new GoogleGenAI({
          apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
        });

        // Convertir la imagen a formato base64
        const fileArrayBuffer = await file.arrayBuffer();
        const fileUint8Array = new Uint8Array(fileArrayBuffer);
        const base64 = btoa(String.fromCharCode(...fileUint8Array));
        const mimeType = file.type;

        // Crear la parte de imagen para la API
        const imagePart = {
          inlineData: {
            data: base64,
            mimeType,
          },
        };

        // Solicitar a Gemini que convierta el boceto en un diseño JSON
        const prompt = `
      Esta es una imagen de un boceto/wireframe de un diseño de interfaz de usuario. 
      Por favor, analiza esta imagen y conviértela en una representación JSON que pueda ser utilizada en una herramienta de diseño.
      
      Identifica todos los elementos de la interfaz como:
      - Encabezados, barras de navegación (rectángulos)
      - Botones (rectángulos)
      - Elementos de texto (etiquetas, títulos)
      - Imágenes o marcadores de posición (rectángulos con X)
      - los elementos que tengan imágenes, tengan el estilo de https://placehold.co
      - los elementos de la interfaz asegúrate de que los elementos estén correctamente organizados y que estén en el orden correcto.
      
      
      El JSON debe seguir esta estructura:
      {
        "layers": {
          "[ID]": {
            "type": [0 para Rectángulo, 1 para Elipse, 3 para Texto],
            "x": [posición_x],
            "y": [posición_y],
            "height": [altura],
            "width": [ancho],
            "fill": {"r": [0-255], "g": [0-255], "b": [0-255]},
            "stroke": {"r": [0-255], "g": [0-255], "b": [0-255]},
            "opacity": [0-100]
          }
          // Para elementos de texto (tipo 3), incluir: fontSize, text, fontWeight, fontFamily
        },
        "layerIds": ["[ID1]", "[ID2]", ...],
        "roomColor": {"r": 30, "g": 30, "b": 30}
      }
      
      Responde solo con el JSON, sin explicaciones.`;

        // Enviar la solicitud a Gemini usando la nueva API
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [createUserContent([prompt, imagePart])],
        });

        // Corregido: Acceder correctamente al texto de la respuesta según la estructura de la API
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          throw new Error("No se pudo obtener respuesta de texto de Gemini");
        }

        // Extraer el JSON de la respuesta
        const jsonMatch =
          text.match(/```json\n([\s\S]*?)\n```/) ||
          text.match(/```\n([\s\S]*?)\n```/) ||
          text.match(/{[\s\S]*}/);

        if (!jsonMatch) {
          throw new Error("No se pudo extraer JSON de la respuesta de Gemini");
        }

        // Parsear el JSON - Corregido para manejar posibles undefined
        const jsonString = jsonMatch[0].startsWith("{")
          ? jsonMatch[0]
          : jsonMatch[1] || jsonMatch[0];
        const jsonData = JSON.parse(jsonString);

        // Importar el diseño generado
        importFromJSON(jsonData);
      } catch (error) {
        console.error("Error al procesar boceto con Gemini AI:", error);
        alert("Error al procesar el boceto. Por favor, intenta de nuevo.");
      } finally {
        setIsProcessingSketch(false);
      }
    },
    [importFromJSON],
  );

  // Manejador para la carga de imágenes de boceto
  const handleSketchUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      processSketchWithGemini(file);

      // Limpiar el input para permitir cargar la misma imagen nuevamente
      event.target.value = "";
    },
    [processSketchWithGemini],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const activeElement = document.activeElement;
      const isInputField =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA");

      if (isInputField) return;

      switch (e.key) {
        case "Backspace":
          deleteLayers();
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              history.redo();
            } else {
              history.undo();
            }
          }
          break;
        case "a":
          if (e.ctrlKey || e.metaKey) {
            selectAllLayers();
            break;
          }
          break;
        //begin copy
        //begin copy
        case "c":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            copyLayers();
            break;
          }
          break;
        case "v":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            pasteLayers();
            break;
          }
          break;
        //end copy
        case "s":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            exportToJSON();
            break;
          }
          break;
        case "o":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            fileInputRef.current?.click();
            break;
          }
          break;
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [deleteLayers, exportToJSON]);

useEffect(() => {
  const initialPrompt = (searchParams as any)?.initialPrompt;
  if (initialPrompt) {
    const generate = async () => {
      setIsGeneratingPrompt(true);
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
        });

        const fullPrompt = createDesignPrompt(initialPrompt);

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [createUserContent(fullPrompt)],
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        const match =
          text?.match(/```json\n([\s\S]*?)\n```/) ||
          text?.match(/```\n([\s\S]*?)\n```/) ||
          text?.match(/{[\s\S]*}/);

        const json = JSON.parse(match?.[1] || match?.[0] || "{}");
        importFromJSON(json);
      } catch (err) {
        console.error("Error al cargar diseño inicial:", err);
      } finally {
        setIsGeneratingPrompt(false);
      }
    };

    generate();
  }
}, []);

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }

      history.pause();
      e.stopPropagation();
      if (!self.presence.selection.includes(layerId)) {
        setMyPresence(
          {
            selection: [layerId],
          },
          { addToHistory: true },
        );
      }

      if (e.nativeEvent.button === 2) {
        setState({ mode: CanvasMode.RightClick });
      } else {
        const point = pointerEventToCanvasPoint(e, camera);
        setState({ mode: CanvasMode.Translating, current: point });
      }
    },
    [camera, canvasState.mode, history],
  );

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();
      setState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history],
  );

  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType: LayerType.Rectangle | LayerType.Ellipse | LayerType.Text | LayerType.Input | LayerType.Button | LayerType.Selector | LayerType.Checkbox | LayerType.DatePicker | LayerType.TimePicker,
      position: Point,
    ) => {
      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) {
        return;
      }

      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();
      let layer: LiveObject<Layer> | null = null;

      // Función para verificar si un punto está dentro de un rectángulo
      const isPointInsideRectangle = (point: Point, rect: RectangleLayer) => {
        return (
          point.x >= rect.x &&
          point.x <= rect.x + rect.width &&
          point.y >= rect.y &&
          point.y <= rect.y + rect.height
        );
      };

      // Encontrar el padre potencial (rectángulo que contiene el punto)
      let parentId: string | undefined;
      let isBackground = false;

      if (layerType === LayerType.Rectangle) {
        // Si es un rectángulo, verificar si es el primer layer o si no está dentro de ningún otro rectángulo
        const existingLayers = Array.from(liveLayers.entries());
        const isFirstLayer = existingLayers.length === 0;
        
        if (isFirstLayer) {
          isBackground = true;
        } else {
          // Verificar si está dentro de algún rectángulo existente
          const isInsideAnyRectangle = existingLayers.some(([_, layer]) => {
            const layerData = layer.toObject();
            return layerData.type === LayerType.Rectangle && isPointInsideRectangle(position, layerData as RectangleLayer);
          });
          
          if (!isInsideAnyRectangle) {
            isBackground = true;
          }
        }
      } else {
        // Para otros tipos de layers, buscar el rectángulo padre que los contiene
        const existingLayers = Array.from(liveLayers.entries());
        for (const [id, layer] of existingLayers) {
          const layerData = layer.toObject();
          if (layerData.type === LayerType.Rectangle && isPointInsideRectangle(position, layerData as RectangleLayer)) {
            parentId = id;
            break;
          }
        }
      }

      if (layerType === LayerType.Rectangle) {
        layer = new LiveObject<RectangleLayer>({
          type: LayerType.Rectangle,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          opacity: 100,
          isBackground,
        });
      } else if (layerType === LayerType.Ellipse) {
        layer = new LiveObject<EllipseLayer>({
          type: LayerType.Ellipse,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          opacity: 100,
          parentId,
        });
      } else if (layerType === LayerType.Text) {
        layer = new LiveObject<TextLayer>({
          type: LayerType.Text,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fontSize: 16,
          text: "Text",
          fontWeight: 400,
          fontFamily: "Inter",
          stroke: { r: 217, g: 217, b: 217 },
          fill: { r: 217, g: 217, b: 217 },
          opacity: 100,
          parentId,
        });
      } else if (layerType === LayerType.Input) {
        layer = new LiveObject<InputLayer>({
          type: LayerType.Input,
          x: position.x,
          y: position.y,
          height: 40,
          width: 200,
          fill: { r: 255, g: 255, b: 255 },
          stroke: { r: 200, g: 200, b: 200 },
          opacity: 100,
          cornerRadius: 4,
          placeholder: "Enter text...",
          parentId,
        });
      } else if (layerType === LayerType.Button) {
        layer = new LiveObject<ButtonLayer>({
          type: LayerType.Button,
          x: position.x,
          y: position.y,
          height: 40,
          width: 120,
          fill: { r: 59, g: 130, b: 246 },
          stroke: { r: 37, g: 99, b: 235 },
          opacity: 100,
          cornerRadius: 4,
          text: "Button",
          fontSize: 14,
          fontFamily: "Inter",
          textFill: { r: 255, g: 255, b: 255 },
          parentId,
        });
      } else if (layerType === LayerType.Selector) {
        layer = new LiveObject<SelectorLayer>({
          type: LayerType.Selector,
          x: position.x,
          y: position.y,
          height: 40,
          width: 200,
          fill: { r: 255, g: 255, b: 255 },
          stroke: { r: 200, g: 200, b: 200 },
          opacity: 100,
          cornerRadius: 4,
          options: ["Option 1", "Option 2", "Option 3"],
          selectedOption: "Option 1",
          fontSize: 14,
          fontFamily: "Inter",
          textFill: { r: 0, g: 0, b: 0 },
          parentId,
        });
      } else if (layerType === LayerType.Checkbox) {
        layer = new LiveObject<CheckboxLayer>({
          type: LayerType.Checkbox,
          x: position.x,
          y: position.y,
          height: 20,
          width: 20,
          fill: { r: 255, g: 255, b: 255 },
          stroke: { r: 200, g: 200, b: 200 },
          opacity: 100,
          cornerRadius: 2,
          checked: false,
          label: "Checkbox",
          fontSize: 14,
          fontFamily: "Inter",
          textFill: { r: 0, g: 0, b: 0 },
          parentId,
        });
      } else if (layerType === LayerType.DatePicker) {
        layer = new LiveObject<DatePickerLayer>({
          type: LayerType.DatePicker,
          x: position.x,
          y: position.y,
          height: 40,
          width: 200,
          fill: { r: 255, g: 255, b: 255 },
          stroke: { r: 200, g: 200, b: 200 },
          opacity: 100,
          cornerRadius: 4,
          value: "",
          placeholder: "Select date...",
          fontSize: 14,
          fontFamily: "Inter",
          textFill: { r: 0, g: 0, b: 0 },
          format: "YYYY-MM-DD",
          parentId,
        });
      } else if (layerType === LayerType.TimePicker) {
        layer = new LiveObject<TimePickerLayer>({
          type: LayerType.TimePicker,
          x: position.x,
          y: position.y,
          height: 40,
          width: 200,
          fill: { r: 255, g: 255, b: 255 },
          stroke: { r: 200, g: 200, b: 200 },
          opacity: 100,
          cornerRadius: 4,
          value: "",
          placeholder: "Select time...",
          fontSize: 14,
          fontFamily: "Inter",
          textFill: { r: 0, g: 0, b: 0 },
          format: "HH:mm",
          parentId,
        });
      }

      if (layer) {
        liveLayerIds.push(layerId);
        liveLayers.set(layerId, layer);

        setMyPresence({ selection: [layerId] }, { addToHistory: true });
        setState({ mode: CanvasMode.None });
      }
    },
    [],
  );

  const insertPath = useMutation(({ storage, self, setMyPresence }) => {
    const liveLayers = storage.get("layers");
    const { pencilDraft } = self.presence;

    if (
      pencilDraft === null ||
      pencilDraft.length < 2 ||
      liveLayers.size >= MAX_LAYERS
    ) {
      setMyPresence({ pencilDraft: null });
      return;
    }

    const id = nanoid();
    liveLayers.set(
      id,
      new LiveObject(
        penPointsToPathPayer(pencilDraft, { r: 217, g: 217, b: 217 }),
      ),
    );

    const liveLayerIds = storage.get("layerIds");
    liveLayerIds.push(id);
    setMyPresence({ pencilDraft: null });
    setState({ mode: CanvasMode.Pencil });
  }, []);

  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const liveLayers = storage.get("layers");
      
      // Función para mover un layer y sus hijos
      const moveLayerAndChildren = (layerId: string) => {
        const layer = liveLayers.get(layerId);
        if (layer) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });

          // Encontrar y mover todos los hijos
          const children = Array.from(liveLayers.entries())
            .filter(([_, l]) => l.get("parentId") === layerId)
            .map(([id]) => id);

          children.forEach(childId => {
            moveLayerAndChildren(childId);
          });
        }
      };

      // Mover cada layer seleccionado y sus hijos
      for (const id of self.presence.selection) {
        moveLayerAndChildren(id);
      }

      setState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState],
  );

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point,
      );

      const liveLayers = storage.get("layers");

      if (self.presence.selection.length > 0) {
        const layer = liveLayers.get(self.presence.selection[0]!);
        if (layer) {
          layer.update(bounds);
        }
      }

      // Update layers to set the new width and height of the layer
    },
    [canvasState],
  );

  const unselectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: { r: 217, g: 217, b: 217 },
      });
    },
    [],
  );

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence;

      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft === null
      ) {
        return;
      }

      setMyPresence({
        cursor: point,
        pencilDraft: [...pencilDraft, [point.x, point.y, e.pressure]],
      });
    },
    [canvasState.mode],
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
      zoom: camera.zoom,
    }));
  }, []);

  const onPointerDown = useMutation(
    ({}, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.Dragging, origin: point });
        return;
      }

      if (canvasState.mode === CanvasMode.Inserting) return;

      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure);
        return;
      }

      setState({ origin: point, mode: CanvasMode.Pressing });
    },
    [camera, canvasState.mode, setState, startDrawing],
  );

  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      setState({ mode: CanvasMode.SelectionNet, origin, current });
    }
  }, []);

  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      if (layerIds) {
        const layers = storage.get("layers").toImmutable();
        setState({
          mode: CanvasMode.SelectionNet,
          origin,
          current,
        });
        const ids = findIntersectionLayersWithRectangle(
          layerIds,
          layers,
          origin,
          current,
        );
        setMyPresence({ selection: ids });
      }
    },
    [layerIds],
  );

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(point, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(point, canvasState.origin);
      } else if (
        canvasState.mode === CanvasMode.Dragging &&
        canvasState.origin !== null
      ) {
        const deltaX = e.movementX;
        const deltaY = e.movementY;

        setCamera((camera) => ({
          x: camera.x + deltaX,
          y: camera.y + deltaY,
          zoom: camera.zoom,
        }));
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(point);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(point, e);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(point);
      }
      setMyPresence({ cursor: point });
    },
    [
      camera,
      canvasState,
      translateSelectedLayers,
      continueDrawing,
      resizeSelectedLayer,
      updateSelectionNet,
      startMultiSelection,
    ],
  );

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  const onPointerUp = useMutation(
    ({}, e: React.PointerEvent) => {
      if (canvasState.mode === CanvasMode.RightClick) return;

      const point = pointerEventToCanvasPoint(e, camera);

      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unselectLayers();
        setState({ mode: CanvasMode.None });
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.Dragging, origin: null });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath();
      } else {
        setState({ mode: CanvasMode.None });
      }
      history.resume();
    },
    [canvasState, setState, insertLayer, unselectLayers, history],
  );

  return (
    <div className="flex h-screen w-full">
      <main className="fixed left-0 right-0 h-screen overflow-y-auto">
        {/* Reemplazar los botones antiguos con el nuevo ToolbarTop */}
        <ToolbarTop
          onSketchClick={() => sketchImageInputRef.current?.click()}
          onPromptClick={async () => {
            const prompt = window.prompt("¿Qué deseas generar con IA?");
            if (!prompt) return;

            try {
              setIsGeneratingPrompt(true);

              const ai = new GoogleGenAI({
                apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
              });

              const fullPrompt = createDesignPrompt(prompt);

              const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [createUserContent(fullPrompt)],
              });

              const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
              const match =
                text?.match(/```json\n([\s\S]*?)\n```/) ||
                text?.match(/```\n([\s\S]*?)\n```/) ||
                text?.match(/{[\s\S]*}/);

              const json = JSON.parse(match?.[1] || match?.[0] || "{}");
              importFromJSON(json);
            } catch (error) {
              console.error("Error con Gemini:", error);
              alert("Hubo un problema al generar el diseño con IA.");
            } finally {
              setIsGeneratingPrompt(false);
            }
          }}
          onFlutterClick={() => generateFlutterProject()}
          isProcessingSketch={isProcessingSketch}
          isGeneratingPrompt={isGeneratingPrompt}
        />

        <div
          style={{
            backgroundColor: roomColor ? colorToCss(roomColor) : "#1e1e1e",
          }}
          className="h-full w-full touch-none"
        >
          <SelectionTools camera={camera} canvasMode={canvasState.mode} />
          <svg
            onWheel={onWheel}
            onPointerUp={onPointerUp}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            className="h-full w-full"
            onContextMenu={(e) => e.preventDefault()}
          >
            <g
              style={{
                transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
              }}
            >
              {layerIds?.map((layerId) => (
                <LayerComponent
                  key={layerId}
                  id={layerId}
                  onLayerPointerDown={onLayerPointerDown}
                />
              ))}
              <SelectionBox
                onResizeHandlePointerDown={onResizeHandlePointerDown}
              />
              {canvasState.mode === CanvasMode.SelectionNet &&
                canvasState.current != null && (
                  <rect
                    className="fill-blue-600/5 stroke-blue-600 stroke-[0.5]"
                    x={Math.min(canvasState.origin.x, canvasState.current.x)}
                    y={Math.min(canvasState.origin.y, canvasState.current.y)}
                    width={Math.abs(
                      canvasState.origin.x - canvasState.current.x,
                    )}
                    height={Math.abs(
                      canvasState.origin.y - canvasState.current.y,
                    )}
                  />
                )}
              <MultiplayerGuides />
              {pencilDraft !== null && pencilDraft.length > 0 && (
                <Path
                  x={0}
                  y={0}
                  opacity={100}
                  fill={colorToCss({ r: 217, g: 217, b: 217 })}
                  points={pencilDraft}
                />
              )}
            </g>
          </svg>
        </div>
      </main>

      <ToolsBar
        canvasState={canvasState}
        setCanvasState={(newState) => setState(newState)}
        zoomIn={() => {
          setCamera((camera) => ({ ...camera, zoom: camera.zoom + 0.1 }));
        }}
        zoomOut={() => {
          setCamera((camera) => ({ ...camera, zoom: camera.zoom - 0.1 }));
        }}
        canZoomIn={camera.zoom < 2}
        canZoomOut={camera.zoom > 0.5}
        redo={() => history.redo()}
        undo={() => history.undo()}
        canRedo={canRedo}
        canUndo={canUndo}
      />
      <Sidebars
        roomName={roomName}
        roomId={roomId}
        othersWithAccessToRoom={othersWithAccessToRoom}
        leftIsMinimized={leftIsMinimized}
        setLeftIsMinimized={setLeftIsMinimized}
      />
    </div>
  );
}
