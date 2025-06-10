import { useMutation } from "@liveblocks/react";
import { nanoid } from "nanoid";
import { LayerType } from "~/types";

// Función principal para generar un proyecto Flutter a partir del diseño actual
export const useFlutterProjectGenerator = (roomName: string) => {
  const generateFlutterProject = useMutation(async ({ storage }) => {
    try {
      // Obtener los datos del canvas
      const layers = storage.get("layers").toImmutable();
      const layerIdsArray = storage.get("layerIds").toImmutable();
      const canvasColor = storage.get("roomColor");
      
      // Convertir el mapa de capas a un objeto para JSON
      const layersObject: Record<string, any> = {};
      layers.forEach((layer, id) => {
        layersObject[id] = JSON.parse(JSON.stringify(layer));
      });
      
      const canvasData = {
        layers: layersObject,
        layerIds: layerIdsArray,
        roomColor: canvasColor,
        exportedAt: new Date().toISOString(),
        name: roomName
      };
      
      // Generar estructura de proyecto Flutter
      const flutterProject = {
        // Archivos de configuración
        'pubspec.yaml': generatePubspecYaml(roomName),
        'analysis_options.yaml': generateAnalysisOptions(),
        // Archivos de la aplicación
        'lib/main.dart': generateMainDart(canvasData),
        'lib/app.dart': generateAppDart(canvasData),
        'lib/canvas_widget.dart': generateCanvasWidget(canvasData),
        'lib/widgets/rectangle_widget.dart': generateRectangleWidget(),
        'lib/widgets/ellipse_widget.dart': generateEllipseWidget(),
        'lib/widgets/text_widget.dart': generateTextWidget(),
        'lib/widgets/input_widget.dart': generateInputWidget(),
        'lib/widgets/button_widget.dart': generateButtonWidget(),
        'lib/widgets/selector_widget.dart': generateSelectorWidget(),
        // README con instrucciones
        'README.md': generateReadme(roomName)
      };
      
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
      
      alert('Proyecto Flutter generado con éxito. Descomprime el archivo y ejecuta "flutter pub get" para instalar las dependencias.');
      
    } catch (error) {
      console.error("Error generando proyecto Flutter:", error);
      alert("Error al generar el proyecto Flutter. Por favor, intenta de nuevo.");
    }
  }, [roomName]);

  return generateFlutterProject;
};

// Funciones auxiliares para generar archivos del proyecto Flutter
const generatePubspecYaml = (projectName: string) => {
  return `name: ${projectName.toLowerCase().replace(/\s+/g, '_')}
description: A Flutter project generated from Figma Clone design.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true
`;
};

const generateAnalysisOptions = () => {
  return `include: package:flutter_lints/flutter.yaml

linter:
  rules:
    - always_declare_return_types
    - avoid_empty_else
    - avoid_print
    - avoid_unused_constructor_parameters
    - await_only_futures
    - camel_case_types
    - cancel_subscriptions
    - constant_identifier_names
    - control_flow_in_finally
    - empty_catches
    - empty_constructor_bodies
    - empty_statements
    - hash_and_equals
    - implementation_imports
    - library_names
    - library_prefixes
    - non_constant_identifier_names
    - package_api_docs
    - package_names
    - package_prefixed_library_names
    - prefer_const_constructors
    - prefer_const_declarations
    - prefer_final_fields
    - prefer_is_empty
    - prefer_is_not_empty
    - prefer_typing_uninitialized_variables
    - sort_child_properties_last
    - test_types_in_equals
    - throw_in_finally
    - unnecessary_brace_in_string_interps
    - unnecessary_getters_setters
    - unnecessary_new
    - unnecessary_null_aware_assignments
    - unnecessary_statements
    - unnecessary_this
    - unrelated_type_equality_checks
    - valid_regexps
`;
};

const generateMainDart = (canvasData: any) => {
  return `import 'package:flutter/material.dart';
import 'app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}
`;
};

const generateAppDart = (canvasData: any) => {
  return `import 'package:flutter/material.dart';
import 'canvas_widget.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${canvasData.name || "Canvas Design"}',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const CanvasWidget(),
    );
  }
}
`;
};

const generateCanvasWidget = (canvasData: any) => {
  return `import 'package:flutter/material.dart';
import 'widgets/rectangle_widget.dart';
import 'widgets/ellipse_widget.dart';
import 'widgets/text_widget.dart';
import 'widgets/input_widget.dart';
import 'widgets/button_widget.dart';
import 'widgets/selector_widget.dart';

class CanvasWidget extends StatefulWidget {
  const CanvasWidget({super.key});

  @override
  State<CanvasWidget> createState() => _CanvasWidgetState();
}

class _CanvasWidgetState extends State<CanvasWidget> {
  double scale = 1.0;
  final Map<String, dynamic> canvasData = ${JSON.stringify(canvasData, null, 2)};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      adjustDesignToScreen();
    });
  }

  void adjustDesignToScreen() {
    // Obtener dimensiones del primer layer (background)
    final layers = canvasData['layers'] as Map<String, dynamic>;
    final firstLayerId = canvasData['layerIds'][0] as String;
    final backgroundLayer = layers[firstLayerId];
    
    if (backgroundLayer != null) {
      final bgWidth = (backgroundLayer['width'] as num?)?.toDouble() ?? 286.0;
      final bgHeight = (backgroundLayer['height'] as num?)?.toDouble() ?? 376.0;
      
      // Dimensiones de la pantalla
      final screenWidth = MediaQuery.of(context).size.width;
      final screenHeight = MediaQuery.of(context).size.height;
      
      // Calcular escala para que quepa en pantalla con margen
      const margin = 40.0;
      final scaleX = (screenWidth - margin * 2) / bgWidth;
      final scaleY = (screenHeight - margin * 2) / bgHeight;
      
      setState(() {
        scale = scaleX < scaleY ? scaleX : scaleY;
        if (scale <= 0) scale = 1.0;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // Color de fondo del canvas (roomColor)
    final roomColor = canvasData['roomColor'] as Map<String, dynamic>?;
    final backgroundColor = roomColor != null 
        ? Color.fromRGBO(
            roomColor['r'] ?? 30,
            roomColor['g'] ?? 30,
            roomColor['b'] ?? 30,
            1.0,
          )
        : const Color.fromRGBO(30, 30, 30, 1.0);

    final layers = canvasData['layers'] as Map<String, dynamic>;
    final layerIds = canvasData['layerIds'] as List<dynamic>;
    
    // Obtener el primer layer como background
    final backgroundLayerId = layerIds[0] as String;
    final backgroundLayer = layers[backgroundLayerId];
    
    if (backgroundLayer == null) {
      return Scaffold(
        backgroundColor: backgroundColor,
        body: const Center(
          child: Text('Error: No background layer found', 
                      style: TextStyle(color: Colors.white)),
        ),
      );
    }

    // Coordenadas del background para calcular posiciones relativas
    final bgX = (backgroundLayer['x'] as num?)?.toDouble() ?? 485.0;
    final bgY = (backgroundLayer['y'] as num?)?.toDouble() ?? 286.0;
    final bgWidth = (backgroundLayer['width'] as num?)?.toDouble() ?? 286.0;
    final bgHeight = (backgroundLayer['height'] as num?)?.toDouble() ?? 376.0;

    return Scaffold(
      backgroundColor: backgroundColor,
      body: Center(
        child: Transform.scale(
          scale: scale,
          child: Container(
            width: bgWidth,
            height: bgHeight,
            decoration: BoxDecoration(
              color: backgroundLayer['fill'] != null
                  ? Color.fromRGBO(
                      backgroundLayer['fill']['r'] ?? 99,
                      backgroundLayer['fill']['g'] ?? 101,
                      backgroundLayer['fill']['b'] ?? 251,
                      (backgroundLayer['opacity'] ?? 100) / 100,
                    )
                  : const Color.fromRGBO(99, 101, 251, 1.0),
            ),
            child: Stack(
              children: [
                // Renderizar los demás layers (saltando el background)
                ...layerIds.skip(1).map<Widget>((layerId) {
                  final layer = layers[layerId as String];
                  
                  if (layer == null) return const SizedBox.shrink();

                  final layerType = layer['type'] as int?;
                  
                  // Calcular posición relativa al background
                  final absoluteX = (layer['x'] as num?)?.toDouble() ?? 0.0;
                  final absoluteY = (layer['y'] as num?)?.toDouble() ?? 0.0;
                  final relativeX = absoluteX - bgX;
                  final relativeY = absoluteY - bgY;
                  
                  switch (layerType) {
                    case 0: // Rectangle
                      return RectangleWidget(
                        key: ValueKey(layerId),
                        x: relativeX,
                        y: relativeY,
                        width: (layer['width'] as num?)?.toDouble() ?? 0.0,
                        height: (layer['height'] as num?)?.toDouble() ?? 0.0,
                        fill: layer['fill'] as Map<String, dynamic>?,
                        stroke: layer['stroke'] as Map<String, dynamic>?,
                        opacity: (layer['opacity'] as num?)?.toDouble() ?? 100.0,
                        cornerRadius: (layer['cornerRadius'] as num?)?.toDouble(),
                      );
                    case 1: // Ellipse
                      return EllipseWidget(
                        key: ValueKey(layerId),
                        x: relativeX,
                        y: relativeY,
                        width: (layer['width'] as num?)?.toDouble() ?? 0.0,
                        height: (layer['height'] as num?)?.toDouble() ?? 0.0,
                        fill: layer['fill'] as Map<String, dynamic>?,
                        stroke: layer['stroke'] as Map<String, dynamic>?,
                        opacity: (layer['opacity'] as num?)?.toDouble() ?? 100.0,
                      );
                    case 3: // Text
                      return TextWidget(
                        key: ValueKey(layerId),
                        x: relativeX,
                        y: relativeY,
                        text: layer['text'] as String? ?? '',
                        fontSize: (layer['fontSize'] as num?)?.toDouble() ?? 14.0,
                        fontFamily: layer['fontFamily'] as String? ?? 'Inter',
                        fontWeight: layer['fontWeight'] as String?,
                        fill: layer['fill'] as Map<String, dynamic>?,
                        opacity: (layer['opacity'] as num?)?.toDouble() ?? 100.0,
                      );
                    case 4: // Input
                      return InputWidget(
                        key: ValueKey(layerId),
                        x: relativeX,
                        y: relativeY,
                        width: (layer['width'] as num?)?.toDouble() ?? 0.0,
                        height: (layer['height'] as num?)?.toDouble() ?? 0.0,
                        fill: layer['fill'] as Map<String, dynamic>?,
                        stroke: layer['stroke'] as Map<String, dynamic>?,
                        opacity: (layer['opacity'] as num?)?.toDouble() ?? 100.0,
                        cornerRadius: (layer['cornerRadius'] as num?)?.toDouble(),
                        placeholder: layer['placeholder'] as String? ?? 'Enter text...',
                        fontSize: (layer['fontSize'] as num?)?.toDouble() ?? 14.0,
                        fontFamily: layer['fontFamily'] as String? ?? 'Inter',
                        textFill: layer['textFill'] as Map<String, dynamic>?,
                      );
                    case 5: // Button
                      return ButtonWidget(
                        key: ValueKey(layerId),
                        x: relativeX,
                        y: relativeY,
                        width: (layer['width'] as num?)?.toDouble() ?? 0.0,
                        height: (layer['height'] as num?)?.toDouble() ?? 0.0,
                        fill: layer['fill'] as Map<String, dynamic>?,
                        stroke: layer['stroke'] as Map<String, dynamic>?,
                        opacity: (layer['opacity'] as num?)?.toDouble() ?? 100.0,
                        cornerRadius: (layer['cornerRadius'] as num?)?.toDouble(),
                        text: layer['text'] as String? ?? 'Button',
                        fontSize: (layer['fontSize'] as num?)?.toDouble() ?? 14.0,
                        fontFamily: layer['fontFamily'] as String? ?? 'Inter',
                        textFill: layer['textFill'] as Map<String, dynamic>?,
                      );
                    case 6: // Selector
                      return SelectorWidget(
                        key: ValueKey(layerId),
                        x: relativeX,
                        y: relativeY,
                        width: (layer['width'] as num?)?.toDouble() ?? 0.0,
                        height: (layer['height'] as num?)?.toDouble() ?? 0.0,
                        fill: layer['fill'] as Map<String, dynamic>?,
                        stroke: layer['stroke'] as Map<String, dynamic>?,
                        opacity: (layer['opacity'] as num?)?.toDouble() ?? 100.0,
                        cornerRadius: (layer['cornerRadius'] as num?)?.toDouble(),
                        options: (layer['options'] as List<dynamic>?)?.cast<String>() ?? ['Option 1', 'Option 2'],
                        selectedOption: layer['selectedOption'] as String?,
                        fontSize: (layer['fontSize'] as num?)?.toDouble() ?? 14.0,
                        fontFamily: layer['fontFamily'] as String? ?? 'Inter',
                        textFill: layer['textFill'] as Map<String, dynamic>?,
                      );
                    default:
                      return const SizedBox.shrink();
                  }
                }).toList(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
`;
};

const generateRectangleWidget = () => {
  return `import 'package:flutter/material.dart';

class RectangleWidget extends StatelessWidget {
  final double x;
  final double y;
  final double width;
  final double height;
  final Map<String, dynamic>? fill;
  final Map<String, dynamic>? stroke;
  final double? opacity;
  final double? cornerRadius;

  const RectangleWidget({
    super.key,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.fill,
    this.stroke,
    this.opacity,
    this.cornerRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: x,
      top: y,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: fill != null
              ? Color.fromRGBO(
                  fill!['r'] ?? 255,
                  fill!['g'] ?? 255,
                  fill!['b'] ?? 255,
                  (opacity ?? 100) / 100,
                )
              : null,
          border: stroke != null
              ? Border.all(
                  color: Color.fromRGBO(
                    stroke!['r'] ?? 0,
                    stroke!['g'] ?? 0,
                    stroke!['b'] ?? 0,
                    (opacity ?? 100) / 100,
                  ),
                )
              : null,
          borderRadius: cornerRadius != null 
              ? BorderRadius.circular(cornerRadius!) 
              : null,
        ),
      ),
    );
  }
}
`;
};

const generateEllipseWidget = () => {
  return `import 'package:flutter/material.dart';

class EllipseWidget extends StatelessWidget {
  final double x;
  final double y;
  final double width;
  final double height;
  final Map<String, dynamic>? fill;
  final Map<String, dynamic>? stroke;
  final double? opacity;

  const EllipseWidget({
    super.key,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.fill,
    this.stroke,
    this.opacity,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: x,
      top: y,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: fill != null
              ? Color.fromRGBO(
                  fill!['r'] ?? 255,
                  fill!['g'] ?? 255,
                  fill!['b'] ?? 255,
                  (opacity ?? 100) / 100,
                )
              : null,
          border: stroke != null
              ? Border.all(
                  color: Color.fromRGBO(
                    stroke!['r'] ?? 0,
                    stroke!['g'] ?? 0,
                    stroke!['b'] ?? 0,
                    (opacity ?? 100) / 100,
                  ),
                )
              : null,
          borderRadius: BorderRadius.circular(width / 2),
        ),
      ),
    );
  }
}
`;
};

const generateTextWidget = () => {
  return `import 'package:flutter/material.dart';

class TextWidget extends StatelessWidget {
  final double x;
  final double y;
  final String text;
  final double? fontSize;
  final String? fontFamily;
  final String? fontWeight;
  final Map<String, dynamic>? fill;
  final double? opacity;

  const TextWidget({
    super.key,
    required this.x,
    required this.y,
    required this.text,
    this.fontSize,
    this.fontFamily,
    this.fontWeight,
    this.fill,
    this.opacity,
  });

  FontWeight _getFontWeight(String? weight) {
    if (weight == null) return FontWeight.normal;
    
    // Convertir peso numérico a FontWeight
    switch (weight) {
      case '100':
        return FontWeight.w100;
      case '200':
        return FontWeight.w200;
      case '300':
        return FontWeight.w300;
      case '400':
        return FontWeight.w400;
      case '500':
        return FontWeight.w500;
      case '600':
        return FontWeight.w600;
      case '700':
        return FontWeight.w700;
      case '800':
        return FontWeight.w800;
      case '900':
        return FontWeight.w900;
      case 'bold':
        return FontWeight.bold;
      default:
        return FontWeight.normal;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: x,
      top: y,
      child: Text(
        text,
        style: TextStyle(
          fontSize: fontSize ?? 16,
          fontFamily: fontFamily ?? 'Arial',
          fontWeight: _getFontWeight(fontWeight),
          color: fill != null
              ? Color.fromRGBO(
                  fill!['r'] ?? 0,
                  fill!['g'] ?? 0,
                  fill!['b'] ?? 0,
                  (opacity ?? 100) / 100,
                )
              : Colors.black, // Color por defecto
        ),
      ),
    );
  }
}
`;
};

const generateInputWidget = () => {
  return `import 'package:flutter/material.dart';

class InputWidget extends StatefulWidget {
  final double x;
  final double y;
  final double width;
  final double height;
  final Map<String, dynamic>? fill;
  final Map<String, dynamic>? stroke;
  final double? opacity;
  final double? cornerRadius;
  final String? placeholder;
  final double? fontSize;
  final String? fontFamily;
  final Map<String, dynamic>? textFill;

  const InputWidget({
    super.key,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.fill,
    this.stroke,
    this.opacity,
    this.cornerRadius,
    this.placeholder,
    this.fontSize,
    this.fontFamily,
    this.textFill,
  });

  @override
  State<InputWidget> createState() => _InputWidgetState();
}

class _InputWidgetState extends State<InputWidget> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: widget.x,
      top: widget.y,
      child: Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: widget.fill != null
              ? Color.fromRGBO(
                  widget.fill!['r'] ?? 255,
                  widget.fill!['g'] ?? 255,
                  widget.fill!['b'] ?? 255,
                  (widget.opacity ?? 100) / 100,
                )
              : Colors.white,
          border: widget.stroke != null
              ? Border.all(
                  color: Color.fromRGBO(
                    widget.stroke!['r'] ?? 0,
                    widget.stroke!['g'] ?? 0,
                    widget.stroke!['b'] ?? 0,
                    (widget.opacity ?? 100) / 100,
                  ),
                )
              : Border.all(color: Colors.grey),
          borderRadius: widget.cornerRadius != null 
              ? BorderRadius.circular(widget.cornerRadius!) 
              : BorderRadius.circular(4),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8.0),
          child: TextField(
            controller: _controller,
            style: TextStyle(
              fontSize: widget.fontSize ?? 14,
              fontFamily: widget.fontFamily ?? 'Arial',
              color: widget.textFill != null
                  ? Color.fromRGBO(
                      widget.textFill!['r'] ?? 0,
                      widget.textFill!['g'] ?? 0,
                      widget.textFill!['b'] ?? 0,
                      (widget.opacity ?? 100) / 100,
                    )
                  : Colors.black,
            ),
            decoration: InputDecoration(
              hintText: widget.placeholder ?? 'Enter text...',
              border: InputBorder.none,
              hintStyle: TextStyle(
                color: widget.textFill != null
                    ? Color.fromRGBO(
                        widget.textFill!['r'] ?? 0,
                        widget.textFill!['g'] ?? 0,
                        widget.textFill!['b'] ?? 0,
                        0.5,
                      )
                    : Colors.grey,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
`;
};

const generateButtonWidget = () => {
  return `import 'package:flutter/material.dart';

class ButtonWidget extends StatelessWidget {
  final double x;
  final double y;
  final double width;
  final double height;
  final Map<String, dynamic>? fill;
  final Map<String, dynamic>? stroke;
  final double? opacity;
  final double? cornerRadius;
  final String text;
  final double? fontSize;
  final String? fontFamily;
  final Map<String, dynamic>? textFill;

  const ButtonWidget({
    super.key,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.fill,
    this.stroke,
    this.opacity,
    this.cornerRadius,
    required this.text,
    this.fontSize,
    this.fontFamily,
    this.textFill,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: x,
      top: y,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: fill != null
              ? Color.fromRGBO(
                  fill!['r'] ?? 33,
                  fill!['g'] ?? 150,
                  fill!['b'] ?? 243,
                  (opacity ?? 100) / 100,
                )
              : Colors.blue,
          border: stroke != null
              ? Border.all(
                  color: Color.fromRGBO(
                    stroke!['r'] ?? 0,
                    stroke!['g'] ?? 0,
                    stroke!['b'] ?? 0,
                    (opacity ?? 100) / 100,
                  ),
                )
              : null,
          borderRadius: cornerRadius != null 
              ? BorderRadius.circular(cornerRadius!) 
              : BorderRadius.circular(8),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: cornerRadius != null 
                ? BorderRadius.circular(cornerRadius!) 
                : BorderRadius.circular(8),
            onTap: () {
              // Acción del botón
              print('Button "$text" pressed');
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Button "$text" pressed'),
                  duration: const Duration(seconds: 1),
                ),
              );
            },
            child: Center(
              child: Text(
                text,
                style: TextStyle(
                  fontSize: fontSize ?? 16,
                  fontFamily: fontFamily ?? 'Arial',
                  fontWeight: FontWeight.w500,
                  color: textFill != null
                      ? Color.fromRGBO(
                          textFill!['r'] ?? 255,
                          textFill!['g'] ?? 255,
                          textFill!['b'] ?? 255,
                          (opacity ?? 100) / 100,
                        )
                      : Colors.white,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
`;
};

const generateSelectorWidget = () => {
  return `import 'package:flutter/material.dart';

class SelectorWidget extends StatefulWidget {
  final double x;
  final double y;
  final double width;
  final double height;
  final Map<String, dynamic>? fill;
  final Map<String, dynamic>? stroke;
  final double? opacity;
  final double? cornerRadius;
  final List<String> options;
  final String? selectedOption;
  final double? fontSize;
  final String? fontFamily;
  final Map<String, dynamic>? textFill;

  const SelectorWidget({
    super.key,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.fill,
    this.stroke,
    this.opacity,
    this.cornerRadius,
    required this.options,
    this.selectedOption,
    this.fontSize,
    this.fontFamily,
    this.textFill,
  });

  @override
  State<SelectorWidget> createState() => _SelectorWidgetState();
}

class _SelectorWidgetState extends State<SelectorWidget> {
  String? selectedValue;

  @override
  void initState() {
    super.initState();
    selectedValue = widget.selectedOption ?? 
        (widget.options.isNotEmpty ? widget.options.first : null);
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: widget.x,
      top: widget.y,
      child: Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: widget.fill != null
              ? Color.fromRGBO(
                  widget.fill!['r'] ?? 255,
                  widget.fill!['g'] ?? 255,
                  widget.fill!['b'] ?? 255,
                  (widget.opacity ?? 100) / 100,
                )
              : Colors.white,
          border: widget.stroke != null
              ? Border.all(
                  color: Color.fromRGBO(
                    widget.stroke!['r'] ?? 0,
                    widget.stroke!['g'] ?? 0,
                    widget.stroke!['b'] ?? 0,
                    (widget.opacity ?? 100) / 100,
                  ),
                )
              : Border.all(color: Colors.grey),
          borderRadius: widget.cornerRadius != null 
              ? BorderRadius.circular(widget.cornerRadius!) 
              : BorderRadius.circular(4),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8.0),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: selectedValue,
              isExpanded: true,
              icon: const Icon(Icons.arrow_drop_down),
              style: TextStyle(
                fontSize: widget.fontSize ?? 14,
                fontFamily: widget.fontFamily ?? 'Arial',
                color: widget.textFill != null
                    ? Color.fromRGBO(
                        widget.textFill!['r'] ?? 0,
                        widget.textFill!['g'] ?? 0,
                        widget.textFill!['b'] ?? 0,
                        (widget.opacity ?? 100) / 100,
                      )
                    : Colors.black,
              ),
              items: widget.options.map<DropdownMenuItem<String>>((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(value),
                );
              }).toList(),
              onChanged: (String? newValue) {
                setState(() {
                  selectedValue = newValue;
                });
                print('Selected: $newValue');
              },
            ),
          ),
        ),
      ),
    );
  }
}
`;
};

const generateReadme = (projectName: string) => {
  return `# ${projectName} - Flutter Project

Este proyecto Flutter fue generado automáticamente a partir de un diseño creado en Figma Clone.

## Instrucciones de instalación

1. Descomprime el archivo ZIP
2. Abre una terminal en la carpeta del proyecto
3. Ejecuta \`flutter pub get\` para instalar las dependencias
4. Ejecuta \`flutter run\` para iniciar la aplicación

## Estructura del proyecto

- \`lib/main.dart\`: Punto de entrada de la aplicación
- \`lib/app.dart\`: Configuración principal de la aplicación
- \`lib/canvas_widget.dart\`: Widget principal que renderiza el diseño
- \`lib/widgets/\`: Contiene los widgets personalizados para cada tipo de elemento

## Personalización

Puedes modificar cualquier archivo para adaptar el diseño a tus necesidades.
`;
};