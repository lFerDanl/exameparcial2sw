import { useMutation } from "@liveblocks/react";
import { TimePickerLayer } from "~/types";
import { colorToCss } from "~/utils";

export default function TimePicker({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: TimePickerLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) {
  const { x, y, width, height, fill, stroke, opacity, cornerRadius, value, placeholder, fontSize, fontFamily, textFill } = layer;

  const updateTime = useMutation(
    ({ storage }, newValue: string) => {
      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(id);
      if (layer) {
        layer.update({ value: newValue });
      }
    },
    [id],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTime(e.target.value);
  };

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
          border: "none",
          borderRadius: cornerRadius ? `${cornerRadius}px` : "0",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: fill ? colorToCss(fill) : "#FFFFFF",
            border: `1px solid ${stroke ? colorToCss(stroke) : "#CCCCCC"}`,
            borderRadius: cornerRadius ? `${cornerRadius}px` : "0",
            opacity: opacity ? opacity / 100 : 1,
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
          }}
        >
          <input
            type="time"
            value={value || ""}
            onChange={handleChange}
            placeholder={placeholder || "Select time..."}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              fontSize: fontSize ? `${fontSize}px` : "14px",
              fontFamily: fontFamily || "Inter",
              color: textFill ? colorToCss(textFill) : "#000000",
            }}
            onPointerDown={(e) => onPointerDown(e, id)}
          />
        </div>
      </foreignObject>
    </g>
  );
} 