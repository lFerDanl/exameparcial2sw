export type Color = {
  r: number;
  g: number;
  b: number;
};

export type Camera = {
  x: number;
  y: number;
  zoom: number;
};

export enum LayerType {
  Rectangle,
  Ellipse,
  Path,
  Text,
  Input,
  Button,
  Selector,
  Checkbox,
  DatePicker,
  TimePicker,
  Background,
}

export type RectangleLayer = {
  type: LayerType.Rectangle;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  cornerRadius?: number;
  parentId?: string;
};

export type EllipseLayer = {
  type: LayerType.Ellipse;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  parentId?: string;
};

export type PathLayer = {
  type: LayerType.Path;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  points: number[][];
  parentId?: string;
};

export type TextLayer = {
  type: LayerType.Text;
  x: number;
  y: number;
  height: number;
  width: number;
  text: string;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  fill: Color;
  stroke: Color;
  opacity: number;
  parentId?: string;
};

export type InputLayer = {
  type: LayerType.Input;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  cornerRadius?: number;
  placeholder?: string;
  fontSize?: number;
  fontFamily?: string;
  textFill?: Color;
  parentId?: string;
};

export type ButtonLayer = {
  type: LayerType.Button;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  cornerRadius?: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  textFill?: Color;
  parentId?: string;
};

export type SelectorLayer = {
  type: LayerType.Selector;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  cornerRadius?: number;
  options: string[];
  selectedOption?: string;
  fontSize?: number;
  fontFamily?: string;
  textFill?: Color;
  parentId?: string;
};

export type CheckboxLayer = {
  type: LayerType.Checkbox;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  cornerRadius?: number;
  checked: boolean;
  label: string;
  fontSize?: number;
  fontFamily?: string;
  textFill?: Color;
  parentId?: string;
};

export type DatePickerLayer = {
  type: LayerType.DatePicker;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  cornerRadius?: number;
  value: string;
  placeholder?: string;
  fontSize?: number;
  fontFamily?: string;
  textFill?: Color;
  format?: string;
  parentId?: string;
};

export type TimePickerLayer = {
  type: LayerType.TimePicker;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  cornerRadius?: number;
  value: string;
  placeholder?: string;
  fontSize?: number;
  fontFamily?: string;
  textFill?: Color;
  format?: string;
  parentId?: string;
};

export type BackgroundLayer = {
  type: LayerType.Background;
  x: number;
  y: number;
  width: 448;
  height: 950;
  fill: Color;
  stroke: Color;
  opacity: number;
  cornerRadius?: number;
  parentId?: string;
};

export type Layer = RectangleLayer | EllipseLayer | PathLayer | TextLayer | InputLayer | ButtonLayer | SelectorLayer | CheckboxLayer | DatePickerLayer | TimePickerLayer | BackgroundLayer;

export type Point = {
  x: number;
  y: number;
};

export type XYWH = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export enum Side {
  Top = 1,
  Bottom = 2,
  Left = 4,
  Right = 8,
}

export type CanvasState =
  | {
      mode: CanvasMode.None;
    }
  | {
      mode: CanvasMode.RightClick;
    }
  | {
      mode: CanvasMode.SelectionNet;
      origin: Point;
      current?: Point;
    }
  | {
      mode: CanvasMode.Dragging;
      origin: Point | null;
    }
  | {
      mode: CanvasMode.Inserting;
      layerType: LayerType.Rectangle | LayerType.Ellipse | LayerType.Text | LayerType.Input | LayerType.Button | LayerType.Selector | LayerType.Checkbox | LayerType.DatePicker | LayerType.TimePicker | LayerType.Background;
    }
  | {
      mode: CanvasMode.Pencil;
    }
  | {
      mode: CanvasMode.Resizing;
      initialBounds: XYWH;
      corner: Side;
    }
  | {
      mode: CanvasMode.Translating;
      current: Point;
    }
  | {
      mode: CanvasMode.Pressing;
      origin: Point;
    };

export enum CanvasMode {
  None,
  Dragging,
  Inserting,
  Pencil,
  Resizing,
  Translating,
  SelectionNet,
  Pressing,
  RightClick,
}
