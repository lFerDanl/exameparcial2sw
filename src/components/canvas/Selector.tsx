import { SelectorLayer } from "~/types";
import { colorToCss } from "~/utils";

export default function Selector({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: SelectorLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) {
  const { x, y, width, height, fill, stroke, opacity, cornerRadius, options, selectedOption, fontSize, fontFamily, textFill } = layer;

  return (
    <g className="group">
      <rect
        style={{ transform: `translate(${x}px, ${y}px)` }}
        width={width}
        height={height}
        fill="none"
        stroke="#0b99ff"
        strokeWidth="4"
        className="pointer-events-none opacity-0 group-hover:opacity-100"
      />
      <foreignObject
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          overflow: "hidden",
          opacity: `${opacity ?? 100}%`,
        }}
      >
        <select
          onPointerDown={(e) => onPointerDown(e, id)}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: fill ? colorToCss(fill) : "#CCC",
            border: `1px solid ${stroke ? colorToCss(stroke) : "#CCC"}`,
            borderRadius: `${cornerRadius ?? 0}px`,
            padding: "0 8px",
            fontSize: `${fontSize ?? 14}px`,
            fontFamily: fontFamily || "Inter",
            color: textFill ? colorToCss(textFill) : "#000",
            outline: "none",
          }}
          value={selectedOption || options[0] || ""}
        >
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </foreignObject>
    </g>
  );
} 