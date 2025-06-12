import { useState, useRef, useEffect } from "react";
import { BiPointer } from "react-icons/bi";
import { RiHand } from "react-icons/ri";
import { CanvasMode, CanvasState, LayerType } from "~/types";
import IconButton from "./IconButton";
import { IoEllipseOutline, IoSquareOutline, IoTextOutline } from "react-icons/io5";
import { BsSquare, BsList, BsCheckSquare, BsCalendar, BsClock, BsPhone } from "react-icons/bs";

export default function ShapesSelectionButton({
  isActive,
  canvasState,
  onClick,
}: {
  isActive: boolean;
  canvasState: CanvasState;
  onClick: (layerType: LayerType.Rectangle | LayerType.Ellipse | LayerType.Input | LayerType.Button | LayerType.Selector | LayerType.Checkbox | LayerType.DatePicker | LayerType.TimePicker | LayerType.Background) => void;
}) {
  const [isShapesOpen, setIsShapesOpen] = useState(false);
  const [isComponentsOpen, setIsComponentsOpen] = useState(false);
  const shapesMenuRef = useRef<HTMLDivElement>(null);
  const componentsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shapesMenuRef.current && !shapesMenuRef.current.contains(event.target as Node)) {
        setIsShapesOpen(false);
      }
      if (componentsMenuRef.current && !componentsMenuRef.current.contains(event.target as Node)) {
        setIsComponentsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = (layerType: LayerType.Rectangle | LayerType.Ellipse | LayerType.Input | LayerType.Button | LayerType.Selector | LayerType.Checkbox | LayerType.DatePicker | LayerType.TimePicker | LayerType.Background) => {
    onClick(layerType);
    setIsShapesOpen(false);
    setIsComponentsOpen(false);
  };

  return (
    <div className="relative flex gap-2">
      {/* Shapes Dropdown */}
      <div className="relative flex" ref={shapesMenuRef}>
      <IconButton
        isActive={isActive}
        onClick={() => onClick(LayerType.Rectangle)}
      >
        {canvasState.mode !== CanvasMode.Inserting && (
          <IoSquareOutline className="h-5 w-5" />
        )}
        {canvasState.mode === CanvasMode.Inserting &&
          (canvasState.layerType === LayerType.Rectangle ||
            canvasState.layerType === LayerType.Text) && (
            <IoSquareOutline className="h-5 w-5" />
          )}
        {canvasState.mode === CanvasMode.Inserting &&
          canvasState.layerType === LayerType.Ellipse && (
            <IoEllipseOutline className="h-5 w-5" />
          )}
      </IconButton>
        <button onClick={() => setIsShapesOpen(!isShapesOpen)} className="ml-1 rotate-180">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path
            d="M3.646 6.354l-3-3 .708-.708L4 5.293l2.646-2.647.708.708-3 3L4 6.707l-.354-.353z"
            fill="currentColor"
          />
        </svg>
      </button>
        {isShapesOpen && (
          <div className="absolute -top-24 mt-1 min-w-[150px] rounded-xl bg-[#1e1e1e] p-2 shadow-lg">
          <button
            className={`flex w-full items-center rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Rectangle ? "bg-blue-500" : ""}`}
            onClick={() => handleClick(LayerType.Rectangle)}
          >
            <span className="w-5 text-xs">
              {canvasState.mode === CanvasMode.Inserting &&
                canvasState.layerType === LayerType.Rectangle &&
                "✓"}
            </span>
            <IoSquareOutline className="mr-2 h-4 w-4" />
            <span className="text-xs">Rectangle</span>
          </button>
          <button
            className={`flex w-full items-center rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Ellipse ? "bg-blue-500" : ""}`}
            onClick={() => handleClick(LayerType.Ellipse)}
          >
            <span className="w-5 text-xs">
              {canvasState.mode === CanvasMode.Inserting &&
                canvasState.layerType === LayerType.Ellipse &&
                "✓"}
            </span>
            <IoEllipseOutline className="mr-2 h-4 w-4" />
            <span className="text-xs">Ellipse</span>
          </button>
          <button
              className={`flex w-full items-center rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Background ? "bg-blue-500" : ""}`}
              onClick={() => handleClick(LayerType.Background)}
            >
              <span className="w-5 text-xs">
                {canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === LayerType.Background &&
                  "✓"}
              </span>
              <BsPhone className="mr-2 h-4 w-4" />
              <span className="text-xs">Background</span>
            </button>
          </div>
        )}
      </div>

      {/* Components Dropdown */}
      <div className="relative flex" ref={componentsMenuRef}>
        <IconButton
          isActive={isActive}
          onClick={() => onClick(LayerType.Input)}
        >
          <IoTextOutline className="h-5 w-5" />
        </IconButton>
        <button onClick={() => setIsComponentsOpen(!isComponentsOpen)} className="ml-1 rotate-180">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path
              d="M3.646 6.354l-3-3 .708-.708L4 5.293l2.646-2.647.708.708-3 3L4 6.707l-.354-.353z"
              fill="currentColor"
            />
          </svg>
        </button>
        {isComponentsOpen && (
          <div className="absolute -top-32 mt-1 min-w-[150px] rounded-xl bg-[#1e1e1e] p-2 shadow-lg">
            <button
              className={`flex w-full items-center rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Input ? "bg-blue-500" : ""}`}
              onClick={() => handleClick(LayerType.Input)}
          >
            <span className="w-5 text-xs">
              {canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === LayerType.Input &&
                "✓"}
            </span>
            <IoTextOutline className="mr-2 h-4 w-4" />
            <span className="text-xs">Input Field</span>
          </button>
            <button
              className={`flex w-full items-center rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Button ? "bg-blue-500" : ""}`}
              onClick={() => handleClick(LayerType.Button)}
            >
              <span className="w-5 text-xs">
                {canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === LayerType.Button &&
                  "✓"}
              </span>
              <BsSquare className="mr-2 h-4 w-4" />
              <span className="text-xs">Button</span>
            </button>
            <button
              className={`flex w-full items-center rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Selector ? "bg-blue-500" : ""}`}
              onClick={() => handleClick(LayerType.Selector)}
            >
              <span className="w-5 text-xs">
                {canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === LayerType.Selector &&
                  "✓"}
              </span>
              <BsList className="mr-2 h-4 w-4" />
              <span className="text-xs">Selector</span>
            </button>
            <button
              className={`flex w-full items-center rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Checkbox ? "bg-blue-500" : ""}`}
              onClick={() => handleClick(LayerType.Checkbox)}
            >
              <span className="w-5 text-xs">
                {canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === LayerType.Checkbox &&
                  "✓"}
              </span>
              <BsCheckSquare className="mr-2 h-4 w-4" />
              <span className="text-xs">Checkbox</span>
            </button>
            <button
              className={`flex w-full items-center rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.DatePicker ? "bg-blue-500" : ""}`}
              onClick={() => handleClick(LayerType.DatePicker)}
            >
              <span className="w-5 text-xs">
                {canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === LayerType.DatePicker &&
                  "✓"}
              </span>
              <BsCalendar className="mr-2 h-4 w-4" />
              <span className="text-xs">Date Picker</span>
            </button>
            <button
              className={`flex w-full items-center rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.TimePicker ? "bg-blue-500" : ""}`}
              onClick={() => handleClick(LayerType.TimePicker)}
            >
              <span className="w-5 text-xs">
                {canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === LayerType.TimePicker &&
                  "✓"}
              </span>
              <BsClock className="mr-2 h-4 w-4" />
              <span className="text-xs">Time Picker</span>
            </button>
        </div>
      )}
      </div>
    </div>
  );
}
