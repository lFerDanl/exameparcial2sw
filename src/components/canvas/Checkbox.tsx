import { CheckboxLayer } from "~/types";
import { colorToCss } from "~/utils";

export default function Checkbox({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: CheckboxLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) {
  const { x, y, width, height, fill, stroke, opacity, cornerRadius, checked, label, fontSize, fontFamily, textFill } = layer;

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
      <g style={{ transform: `translate(${x}px, ${y}px)` }}>
        <rect
          onPointerDown={(e) => onPointerDown(e, id)}
          width={width}
          height={height}
          fill={fill ? colorToCss(fill) : "#CCC"}
          strokeWidth={1}
          stroke={stroke ? colorToCss(stroke) : "#CCC"}
          opacity={`${opacity ?? 100}%`}
          rx={cornerRadius ?? 0}
          ry={cornerRadius ?? 0}
        />
        {checked && (
          <path
            d={`M${width * 0.2} ${height * 0.5} L${width * 0.4} ${height * 0.7} L${width * 0.8} ${height * 0.3}`}
            stroke={stroke ? colorToCss(stroke) : "#000"}
            strokeWidth={2}
            fill="none"
          />
        )}
      </g>
      <text
        x={x + width + 8}
        y={y + height / 2}
        dominantBaseline="middle"
        style={{
          fontSize: `${fontSize ?? 14}px`,
          fontFamily: fontFamily ?? "Inter",
          fill: textFill ? colorToCss(textFill) : "#000",
        }}
      >
        {label}
      </text>
    </g>
  );
} 