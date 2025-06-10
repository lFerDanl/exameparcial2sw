export const generatePubspecYaml = (projectName: string) => {
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

export const generateAnalysisOptions = () => {
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

export const generateReadme = (projectName: string) => {
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