import { useMutation } from "@liveblocks/react";
import { nanoid } from "nanoid";
import { LayerType } from "~/types";
import {
  generateRectangleWidget,
  generateEllipseWidget,
  generateTextWidget,
  generateInputWidget,
  generateButtonWidget,
  generateSelectorWidget,
  generateCheckboxWidget,
  generateDatePickerWidget,
  generateTimePickerWidget,
} from "./generators/widgetGenerators";
import {
  generatePubspecYaml,
  generateAnalysisOptions,
  generateReadme,
} from "./generators/configGenerators";
import {
  generateMainDart,
  generateAppDart,
  generateScreenWidget,
  generateNavigationHelper,
  generateHomeScreen,
} from "./generators/appGenerators";

// Función principal para generar un proyecto Flutter a partir del diseño actual
export const useFlutterProjectGenerator = (roomName: string) => {
  const generateFlutterProject = useMutation(async ({ storage }) => {
    try {
      // Obtener los datos del canvas
      const layers = storage.get("layers").toImmutable();
      const layerIdsArray = storage.get("layerIds").toImmutable();
      const canvasColor = storage.get("roomColor");
      
      // Convertir el mapa de capas a un objeto para JSON, asegurando el orden correcto
      const layersObject: Record<string, any> = {};
      layerIdsArray.forEach((id) => {
        const layer = layers.get(id);
        if (layer) {
          layersObject[id] = JSON.parse(JSON.stringify(layer));
        }
      });

      // Separar backgrounds (padres) e hijos
      const backgroundLayers: Array<{id: string, layer: any}> = [];
      const childLayers: Record<string, Array<{id: string, layer: any}>> = {};

      // Identificar backgrounds y agrupar hijos
      Object.entries(layersObject).forEach(([id, layer]) => {
        if (layer.isBackground) {
          backgroundLayers.push({ id, layer });
          childLayers[id] = [];
        }
      });

      // Agrupar hijos con sus padres
      Object.entries(layersObject).forEach(([id, layer]) => {
        if (!layer.isBackground && layer.parentId) {
          if (childLayers[layer.parentId]) {
            (childLayers[layer.parentId] as Array<{id: string, layer: any}>).push({ id, layer });
          }
        }
      });
      
      const canvasData = {
        layers: layersObject,
        layerIds: layerIdsArray,
        roomColor: canvasColor,
        exportedAt: new Date().toISOString(),
        name: roomName,
        backgroundLayers,
        childLayers
      };
      
      // Generar estructura de proyecto Flutter
      const flutterProject: Record<string, string> = {
        // Archivos de configuración
        'pubspec.yaml': generatePubspecYaml(roomName),
        'analysis_options.yaml': generateAnalysisOptions(),
        // Archivos principales de la aplicación
        'lib/main.dart': generateMainDart(canvasData),
        'lib/app.dart': generateAppDart(canvasData),
        'lib/navigation_helper.dart': generateNavigationHelper(canvasData),
        'lib/screens/home_screen.dart': generateHomeScreen(canvasData),
        // Widgets individuales
        'lib/widgets/rectangle_widget.dart': generateRectangleWidget(),
        'lib/widgets/ellipse_widget.dart': generateEllipseWidget(),
        'lib/widgets/text_widget.dart': generateTextWidget(),
        'lib/widgets/input_widget.dart': generateInputWidget(),
        'lib/widgets/button_widget.dart': generateButtonWidget(),
        'lib/widgets/selector_widget.dart': generateSelectorWidget(),
        'lib/widgets/checkbox_widget.dart': generateCheckboxWidget(),
        'lib/widgets/date_picker_widget.dart': generateDatePickerWidget(),
        'lib/widgets/time_picker_widget.dart': generateTimePickerWidget(),
        // README con instrucciones
        'README.md': generateReadme(roomName)
      };

      // Generar una pantalla para cada background
      backgroundLayers.forEach(({ id, layer }) => {
        const screenName = layer.name || id;
        const fileName = `${screenName.toLowerCase().replace(/\s+/g, '_')}_screen.dart`;
        flutterProject[`lib/screens/${fileName}`] = generateScreenWidget(
          canvasData, 
          id, 
          screenName
        );
      });
      
      // Crear un archivo ZIP con todos los archivos
      const JSZip = await import('jszip').then(module => module.default);
      const zip = new JSZip();
      
      // Añadir archivos al ZIP
      Object.entries(flutterProject).forEach(([path, content]) => {
        // Crear carpetas si es necesario
        const folders = path.split('/');
        let currentFolder = zip;
        
        if (folders.length > 1) {
          for (let i = 0; i < folders.length - 1; i++) {
            const folderName = folders[i];
            if (folderName) {
              currentFolder = currentFolder.folder(folderName) || currentFolder;
            }
          }
          const fileName = folders[folders.length - 1];
          if (fileName) {
            currentFolder.file(fileName, content);
          }
        } else {
          zip.file(path, content);
        }
      });
      
      // Generar el ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Descargar el archivo ZIP
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${roomName.replace(/\s+/g, '_')}_flutter_project.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(`Proyecto Flutter generado con éxito con ${backgroundLayers.length} pantallas. Descomprime el archivo y ejecuta "flutter pub get" para instalar las dependencias.`);
      
    } catch (error) {
      console.error("Error generando proyecto Flutter:", error);
      alert("Error al generar el proyecto Flutter. Por favor, intenta de nuevo.");
    }
  }, [roomName]);

  return generateFlutterProject;
};
