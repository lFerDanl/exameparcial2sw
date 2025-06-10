import { ButtonLayer } from "~/types";
import { colorToCss } from "~/utils";

export default function Button({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: ButtonLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) {
  const { x, y, width, height, fill, stroke, opacity, cornerRadius, text, fontSize, fontFamily, textFill } = layer;

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
      <rect
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{ transform: `translate(${x}px, ${y}px)` }}
        width={width}
        height={height}
        fill={fill ? colorToCss(fill) : "#FFFFFF"}
        strokeWidth={1}
        stroke={stroke ? colorToCss(stroke) : "#CCCCCC"}
        opacity={`${opacity ?? 100}%`}
        rx={cornerRadius ?? 4}
        ry={cornerRadius ?? 4}
      />
      <text
        x={x + width/2}
        y={y + height/2 + 4}
        fill={textFill ? colorToCss(textFill) : "#000000"}
        fontSize={fontSize || 14}
        fontFamily={fontFamily || "Inter"}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {text || "Button"}
      </text>
    </g>
  );
} 