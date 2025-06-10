import { useStorage } from "@liveblocks/react";
import { memo } from "react";
import { LayerType } from "~/types";
import Rectangle from "./Rectangle";
import Ellipse from "./Ellipse";
import Text from "./Text";
import Path from "./Path";
import Input from "./Input";
import Button from "./Button";
import Selector from "./Selector";
import Checkbox from "./Checkbox";
import DatePicker from "./DatePicker";
import TimePicker from "./TimePicker";
import { colorToCss } from "~/utils";

const LayerComponent = memo(
  ({
    id,
    onLayerPointerDown,
  }: {
    id: string;
    onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
  }) => {
    const layer = useStorage((root) => root.layers.get(id));
    if (!layer) {
      return null;
    }

    switch (layer.type) {
      case LayerType.Path:
        return (
          <Path
            onPointerDown={(e) => onLayerPointerDown(e, id)}
            points={layer.points}
            x={layer.x}
            y={layer.y}
            fill={layer.fill ? colorToCss(layer.fill) : "#CCC"}
            stroke={layer.stroke ? colorToCss(layer.stroke) : "#CCC"}
            opacity={layer.opacity}
          />
        );
      case LayerType.Rectangle:
        return (
          <Rectangle onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Ellipse:
        return (
          <Ellipse onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Text:
        return (
          <Text onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Input:
        return (
          <Input onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Button:
        return (
          <Button onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Selector:
        return (
          <Selector onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Checkbox:
        return (
          <Checkbox onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.DatePicker:
        return (
          <DatePicker onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.TimePicker:
        return (
          <TimePicker onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      default:
        console.warn("Unknown layer type");
        return null;
    }
  },
);

LayerComponent.displayName = "LayerComponent";

export default LayerComponent;
