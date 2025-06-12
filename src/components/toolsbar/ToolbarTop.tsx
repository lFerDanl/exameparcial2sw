import { RiSketching, RiRobot2Line, RiFlutterFill, RiFileDownloadLine } from "react-icons/ri";

interface ToolbarTopProps {
  onSketchClick: () => void;
  onPromptClick: () => void;
  onFlutterClick: () => void;
  onExportClick: () => void;
  isProcessingSketch: boolean;
  isGeneratingPrompt: boolean;
}

export default function ToolbarTop({
  onSketchClick,
  onPromptClick,
  onFlutterClick,
  onExportClick,
  isProcessingSketch,
  isGeneratingPrompt,
}: ToolbarTopProps) {
  return (
    <div className="fixed top-4 left-1/2 z-10 flex -translate-x-1/2 transform items-center justify-center rounded-lg bg-white p-1 shadow-[0_0_3px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-center gap-3">
        {/* Botón Boceto a Diseño */}
        <button
          onClick={onSketchClick}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
            isProcessingSketch
              ? "bg-gray-100 text-gray-500"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          disabled={isProcessingSketch}
        >
          <RiSketching className="h-5 w-5" />
          <span>{isProcessingSketch ? "Procesando..." : "Boceto a Diseño"}</span>
        </button>

        {/* Botón Prompt IA */}
        <button
          onClick={onPromptClick}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
            isGeneratingPrompt
              ? "bg-gray-100 text-gray-500"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          disabled={isGeneratingPrompt}
        >
          <RiRobot2Line className="h-5 w-5" />
          <span>{isGeneratingPrompt ? "Generando..." : "Prompt IA"}</span>
        </button>

        {/* Botón Generar Flutter */}
        <button
          onClick={onFlutterClick}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
        >
          <RiFlutterFill className="h-5 w-5" />
          <span>Generar Flutter</span>
        </button>

        {/* Botón Exportar JSON */}
        <button
          onClick={onExportClick}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
          title="Export to JSON (Ctrl+S)"
        >
          <RiFileDownloadLine className="h-5 w-5" />
          <span>Exportar JSON</span>
        </button>
      </div>
    </div>
  );
} 