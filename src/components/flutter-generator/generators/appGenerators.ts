// Función auxiliar para convertir a PascalCase
function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '');
}

export const generateMainDart = (canvasData: any) => {
  return `import 'package:flutter/material.dart';
import 'app.dart';

void main() {
  runApp(const MyApp());
}`;
};

export const generateAppDart = (canvasData: any) => {
  const { backgroundLayers } = canvasData;
  
  // Generar imports para todas las pantallas
  const screenImports = backgroundLayers.map(({ id, layer }: { id: string, layer: any }) => {
    const screenName = layer.name || id;
    const fileName = screenName.toLowerCase().replace(/\s+/g, '_');
    return `import 'screens/${fileName}_screen.dart';`;
  }).join('\n');

  return `import 'package:flutter/material.dart';
import 'navigation_helper.dart';
import 'screens/home_screen.dart';
${screenImports}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mi Aplicación',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color.fromRGBO(50, 100, 200, 1.0),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 2,
        ),
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color.fromRGBO(50, 100, 200, 1.0),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 2,
        ),
      ),
      home: const HomeScreen(),
      routes: NavigationHelper.getRoutes(),
    );
  }
}`;
};

export const generateNavigationHelper = (canvasData: any) => {
  const { backgroundLayers } = canvasData;
  
  // Generar imports para todas las pantallas
  const screenImports = backgroundLayers.map(({ id, layer }: { id: string, layer: any }) => {
    const screenName = layer.name || id;
    const fileName = screenName.toLowerCase().replace(/\s+/g, '_');
    return `import 'screens/${fileName}_screen.dart';`;
  }).join('\n');

  // Generar rutas
  const routes = backgroundLayers.map(({ id, layer }: { id: string, layer: any }) => {
    const screenName = layer.name || id;
    const routeName = '/' + screenName.toLowerCase().replace(/\s+/g, '_');
    const className = toPascalCase(screenName) + 'Screen';
    return `      '${routeName}': (context) => const ${className}(),`;
  }).join('\n');

  // Generar métodos de navegación
  const navigationMethods = backgroundLayers.map(({ id, layer }: { id: string, layer: any }) => {
    const screenName = layer.name || id;
    const methodName = 'goTo' + toPascalCase(screenName);
    const routeName = '/' + screenName.toLowerCase().replace(/\s+/g, '_');
    return `  static void ${methodName}(BuildContext context) {
    Navigator.pushNamed(context, '${routeName}');
  }`;
  }).join('\n\n');

  return `import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
${screenImports}

class NavigationHelper {
  static Map<String, WidgetBuilder> getRoutes() {
    return {
      '/home': (context) => const HomeScreen(),
${routes}
    };
  }

  static void goToHome(BuildContext context) {
    Navigator.pushNamed(context, '/home');
  }

${navigationMethods}

  // Método genérico para navegar por nombre de pantalla
  static void navigateToScreen(BuildContext context, String screenName) {
    final routeName = '/' + screenName.toLowerCase().replaceAll(RegExp(r'\\s+'), '_');
    Navigator.pushNamed(context, routeName);
  }

  // Método para regresar al inicio desde cualquier pantalla
  static void goBackToHome(BuildContext context) {
    Navigator.pushNamedAndRemoveUntil(
      context,
      '/home',
      (Route<dynamic> route) => false,
    );
  }
}`;
};

export const generateHomeScreen = (canvasData: any) => {
  const { backgroundLayers } = canvasData;
  
  // Generar opciones de navegación para cada pantalla
  const navigationOptions = backgroundLayers.map(({ id, layer }: { id: string, layer: any }) => {
    const screenName = layer.name || id;
    const methodName = 'goTo' + toPascalCase(screenName);
    return `            ListTile(
              leading: const Icon(Icons.dashboard, color: Color.fromRGBO(50, 100, 200, 1.0)),
              title: Text(
                '${screenName}',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              ),
              onTap: () {
                Navigator.pop(context); // Cierra el Drawer
                NavigationHelper.${methodName}(context);
              },
            ),`;
  }).join('\n');

  return `import 'package:flutter/material.dart';
import '../navigation_helper.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Aplicación'),
        backgroundColor: const Color.fromRGBO(50, 100, 200, 1.0),
        foregroundColor: Colors.white,
        elevation: 2,
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: <Widget>[
            const DrawerHeader(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Color.fromRGBO(50, 100, 200, 1.0),
                    Color.fromRGBO(33, 150, 243, 1.0),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Icon(
                    Icons.account_circle,
                    size: 64,
                    color: Colors.white,
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Menú Principal',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.home, color: Color.fromRGBO(50, 100, 200, 1.0)),
              title: const Text(
                'Inicio',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              ),
              onTap: () {
                Navigator.pop(context);
              },
            ),
            const Divider(),
${navigationOptions}
            const Divider(),
            ListTile(
              leading: const Icon(Icons.settings, color: Colors.grey),
              title: const Text(
                'Configuración',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              ),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Configuración - Próximamente'),
                    duration: Duration(seconds: 2),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.info, color: Colors.grey),
              title: const Text(
                'Acerca de',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              ),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Acerca de - Versión 1.0.0'),
                    duration: Duration(seconds: 2),
                  ),
                );
              },
            ),
          ],
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color.fromRGBO(245, 245, 245, 1.0),
              Color.fromRGBO(230, 230, 230, 1.0),
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.home,
                size: 120,
                color: Color.fromRGBO(50, 100, 200, 0.3),
              ),
              SizedBox(height: 24),
              Text(
                'Inicio',
                style: TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                  color: Color.fromRGBO(50, 100, 200, 0.7),
                  letterSpacing: 2,
                ),
              ),
              SizedBox(height: 16),
              Text(
                'Bienvenido a la aplicación',
                style: TextStyle(
                  fontSize: 18,
                  color: Color.fromRGBO(100, 100, 100, 1.0),
                  fontWeight: FontWeight.w300,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Usa el menú lateral para navegar',
                style: TextStyle(
                  fontSize: 14,
                  color: Color.fromRGBO(150, 150, 150, 1.0),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`;
};

export const generateScreenWidget = (canvasData: any, backgroundId: string, screenName: string) => {
  const { layers, childLayers } = canvasData;
  const backgroundLayer = layers[backgroundId];
  const children = childLayers[backgroundId] || [];
  
  const className = `${toPascalCase(screenName)}Screen`;
  
  return `import 'package:flutter/material.dart';
import '../widgets/rectangle_widget.dart';
import '../widgets/ellipse_widget.dart';
import '../widgets/text_widget.dart';
import '../widgets/input_widget.dart';
import '../widgets/button_widget.dart';
import '../widgets/selector_widget.dart';
import '../widgets/checkbox_widget.dart';
import '../widgets/date_picker_widget.dart';
import '../widgets/time_picker_widget.dart';
import '../widgets/background_widget.dart';
import '../navigation_helper.dart';

class ${className} extends StatefulWidget {
  const ${className}({super.key});

  @override
  State<${className}> createState() => _${className}State();
}

class _${className}State extends State<${className}> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${screenName}'),
        backgroundColor: const Color.fromRGBO(50, 100, 200, 1.0),
        foregroundColor: Colors.white,
        elevation: 2,
        actions: [
          IconButton(
            icon: const Icon(Icons.home),
            onPressed: () {
              NavigationHelper.goBackToHome(context);
            },
            tooltip: 'Volver al Inicio',
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Container(
          width: ${backgroundLayer.width}.toDouble(),
          height: ${backgroundLayer.height}.toDouble(),
          child: Stack(
            children: [
              // El fondo usando BackgroundWidget
              BackgroundWidget(
                key: ValueKey('${backgroundId}'),
                x: 0, // Siempre en 0,0 porque es el contenedor base
                y: 0,
                width: ${backgroundLayer.width ?? 0},
                height: ${backgroundLayer.height ?? 0},
                fill: ${backgroundLayer.fill ? `{'r': ${backgroundLayer.fill.r}, 'g': ${backgroundLayer.fill.g}, 'b': ${backgroundLayer.fill.b}}` : 'null'},
                stroke: ${backgroundLayer.stroke ? `{'r': ${backgroundLayer.stroke.r}, 'g': ${backgroundLayer.stroke.g}, 'b': ${backgroundLayer.stroke.b}}` : 'null'},
                opacity: ${backgroundLayer.opacity ?? 100},
                cornerRadius: ${backgroundLayer.cornerRadius ?? 'null'},
              ),
              // Elementos hijos
              ${generateChildWidgets(children, backgroundLayer)}
            ],
          ),
        ),
      ),
    );
  }
}
`;
};

// Función auxiliar para generar widgets hijos
function generateChildWidgets(children: Array<{id: string, layer: any}>, backgroundLayer: any): string {
  if (children.length === 0) return '// No hay elementos hijos';
  
  return children.map(({ id, layer }) => {
    const layerType = layer.type;
    
    // Calcular posición relativa al background
    const absoluteX = layer.x;
    const absoluteY = layer.y;
    const relativeX = absoluteX - backgroundLayer.x;
    const relativeY = absoluteY - backgroundLayer.y;
    
    switch (layerType) {
      case 0: // Rectangle
        return `              RectangleWidget(
                key: ValueKey('${id}'),
                x: ${relativeX},
                y: ${relativeY},
                width: ${layer.width ?? 0},
                height: ${layer.height ?? 0},
                fill: ${layer.fill ? `{'r': ${layer.fill.r}, 'g': ${layer.fill.g}, 'b': ${layer.fill.b}}` : 'null'},
                stroke: ${layer.stroke ? `{'r': ${layer.stroke.r}, 'g': ${layer.stroke.g}, 'b': ${layer.stroke.b}}` : 'null'},
                opacity: ${layer.opacity ?? 100},
                cornerRadius: ${layer.cornerRadius ?? 'null'},
              ),`;
      case 1: // Ellipse
        return `              EllipseWidget(
                key: ValueKey('${id}'),
                x: ${relativeX},
                y: ${relativeY},
                width: ${layer.width ?? 0},
                height: ${layer.height ?? 0},
                fill: ${layer.fill ? `{'r': ${layer.fill.r}, 'g': ${layer.fill.g}, 'b': ${layer.fill.b}}` : 'null'},
                stroke: ${layer.stroke ? `{'r': ${layer.stroke.r}, 'g': ${layer.stroke.g}, 'b': ${layer.stroke.b}}` : 'null'},
                opacity: ${layer.opacity ?? 100},
              ),`;
      case 3: // Text
        return `              TextWidget(
                key: ValueKey('${id}'),
                x: ${relativeX},
                y: ${relativeY},
                text: '${layer.text ?? ''}',
                fontSize: ${layer.fontSize ?? 14},
                fontFamily: '${layer.fontFamily ?? 'Inter'}',
                fontWeight: '${layer.fontWeight ?? '400'}',
                fill: ${layer.fill ? `{'r': ${layer.fill.r}, 'g': ${layer.fill.g}, 'b': ${layer.fill.b}}` : 'null'},
                opacity: ${layer.opacity ?? 100},
              ),`;
      case 4: // Input
        return `              InputWidget(
                key: ValueKey('${id}'),
                x: ${relativeX},
                y: ${relativeY},
                width: ${layer.width ?? 0},
                height: ${layer.height ?? 0},
                fill: ${layer.fill ? `{'r': ${layer.fill.r}, 'g': ${layer.fill.g}, 'b': ${layer.fill.b}}` : 'null'},
                stroke: ${layer.stroke ? `{'r': ${layer.stroke.r}, 'g': ${layer.stroke.g}, 'b': ${layer.stroke.b}}` : 'null'},
                opacity: ${layer.opacity ?? 100},
                cornerRadius: ${layer.cornerRadius ?? 'null'},
                placeholder: '${layer.placeholder ?? 'Enter text...'}',
                fontSize: ${layer.fontSize ?? 14},
                fontFamily: '${layer.fontFamily ?? 'Inter'}',
                textFill: ${layer.textFill ? `{'r': ${layer.textFill.r}, 'g': ${layer.textFill.g}, 'b': ${layer.textFill.b}}` : 'null'},
              ),`;
      case 5: // Button
        return `              ButtonWidget(
                key: ValueKey('${id}'),
                x: ${relativeX},
                y: ${relativeY},
                width: ${layer.width ?? 0},
                height: ${layer.height ?? 0},
                fill: ${layer.fill ? `{'r': ${layer.fill.r}, 'g': ${layer.fill.g}, 'b': ${layer.fill.b}}` : 'null'},
                stroke: ${layer.stroke ? `{'r': ${layer.stroke.r}, 'g': ${layer.stroke.g}, 'b': ${layer.stroke.b}}` : 'null'},
                opacity: ${layer.opacity ?? 100},
                cornerRadius: ${layer.cornerRadius ?? 'null'},
                text: '${layer.text ?? 'Button'}',
                fontSize: ${layer.fontSize ?? 14},
                fontFamily: '${layer.fontFamily ?? 'Inter'}',
                textFill: ${layer.textFill ? `{'r': ${layer.textFill.r}, 'g': ${layer.textFill.g}, 'b': ${layer.textFill.b}}` : 'null'},
              ),`;
      case 6: // Selector
        const options = layer.options ? `[${layer.options.map((opt: string) => `'${opt}'`).join(', ')}]` : `['Option 1', 'Option 2']`;
        return `              SelectorWidget(
                key: ValueKey('${id}'),
                x: ${relativeX},
                y: ${relativeY},
                width: ${layer.width ?? 0},
                height: ${layer.height ?? 0},
                fill: ${layer.fill ? `{'r': ${layer.fill.r}, 'g': ${layer.fill.g}, 'b': ${layer.fill.b}}` : 'null'},
                stroke: ${layer.stroke ? `{'r': ${layer.stroke.r}, 'g': ${layer.stroke.g}, 'b': ${layer.stroke.b}}` : 'null'},
                opacity: ${layer.opacity ?? 100},
                cornerRadius: ${layer.cornerRadius ?? 'null'},
                options: ${options},
                selectedOption: ${layer.selectedOption ? `'${layer.selectedOption}'` : 'null'},
                fontSize: ${layer.fontSize ?? 14},
                fontFamily: '${layer.fontFamily ?? 'Inter'}',
                textFill: ${layer.textFill ? `{'r': ${layer.textFill.r}, 'g': ${layer.textFill.g}, 'b': ${layer.textFill.b}}` : 'null'},
              ),`;
      case 7: // Checkbox
        return `              CheckboxWidget(
                key: ValueKey('${id}'),
                x: ${relativeX},
                y: ${relativeY},
                width: ${layer.width ?? 0},
                height: ${layer.height ?? 0},
                fill: ${layer.fill ? `{'r': ${layer.fill.r}, 'g': ${layer.fill.g}, 'b': ${layer.fill.b}}` : 'null'},
                stroke: ${layer.stroke ? `{'r': ${layer.stroke.r}, 'g': ${layer.stroke.g}, 'b': ${layer.stroke.b}}` : 'null'},
                opacity: ${layer.opacity ?? 100},
                cornerRadius: ${layer.cornerRadius ?? 'null'},
                checked: ${layer.checked ?? false},
                label: '${layer.label ?? 'Checkbox'}',
                fontSize: ${layer.fontSize ?? 14},
                fontFamily: '${layer.fontFamily ?? 'Inter'}',
                textFill: ${layer.textFill ? `{'r': ${layer.textFill.r}, 'g': ${layer.textFill.g}, 'b': ${layer.textFill.b}}` : 'null'},
              ),`;
      case 8: // DatePicker
        return `              DatePickerWidget(
                key: ValueKey('${id}'),
                x: ${relativeX},
                y: ${relativeY},
                width: ${layer.width ?? 0},
                height: ${layer.height ?? 0},
                fill: ${layer.fill ? `{'r': ${layer.fill.r}, 'g': ${layer.fill.g}, 'b': ${layer.fill.b}}` : 'null'},
                stroke: ${layer.stroke ? `{'r': ${layer.stroke.r}, 'g': ${layer.stroke.g}, 'b': ${layer.stroke.b}}` : 'null'},
                opacity: ${layer.opacity ?? 100},
                cornerRadius: ${layer.cornerRadius ?? 'null'},
                value: '${layer.value ?? ''}',
                placeholder: '${layer.placeholder ?? 'Select date...'}',
                fontSize: ${layer.fontSize ?? 14},
                fontFamily: '${layer.fontFamily ?? 'Inter'}',
                textFill: ${layer.textFill ? `{'r': ${layer.textFill.r}, 'g': ${layer.textFill.g}, 'b': ${layer.textFill.b}}` : 'null'},
                format: ${layer.format ? `'${layer.format}'` : 'null'},
              ),`;
      case 9: // TimePicker
        return `              TimePickerWidget(
                key: ValueKey('${id}'),
                x: ${relativeX},
                y: ${relativeY},
                width: ${layer.width ?? 0},
                height: ${layer.height ?? 0},
                fill: ${layer.fill ? `{'r': ${layer.fill.r}, 'g': ${layer.fill.g}, 'b': ${layer.fill.b}}` : 'null'},
                stroke: ${layer.stroke ? `{'r': ${layer.stroke.r}, 'g': ${layer.stroke.g}, 'b': ${layer.stroke.b}}` : 'null'},
                opacity: ${layer.opacity ?? 100},
                cornerRadius: ${layer.cornerRadius ?? 'null'},
                value: '${layer.value ?? ''}',
                placeholder: '${layer.placeholder ?? 'Select time...'}',
                fontSize: ${layer.fontSize ?? 14},
                fontFamily: '${layer.fontFamily ?? 'Inter'}',
                textFill: ${layer.textFill ? `{'r': ${layer.textFill.r}, 'g': ${layer.textFill.g}, 'b': ${layer.textFill.b}}` : 'null'},
                format: ${layer.format ? `'${layer.format}'` : 'null'},
              ),`;
      case 10: // Background
        return `              BackgroundWidget(
                key: ValueKey('${id}'),
                x: ${relativeX},
                y: ${relativeY},
                width: ${layer.width ?? 0},
                height: ${layer.height ?? 0},
                fill: ${layer.fill ? `{'r': ${layer.fill.r}, 'g': ${layer.fill.g}, 'b': ${layer.fill.b}}` : 'null'},
                stroke: ${layer.stroke ? `{'r': ${layer.stroke.r}, 'g': ${layer.stroke.g}, 'b': ${layer.stroke.b}}` : 'null'},
                opacity: ${layer.opacity ?? 100},
                cornerRadius: ${layer.cornerRadius ?? 'null'},
              ),`;
      default:
        return `              // Widget tipo ${layerType} no soportado`;
    }
  }).join('\n');
}