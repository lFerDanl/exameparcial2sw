"use client";

import { useMutation, useOthers, useSelf, useStorage } from "@liveblocks/react";
import Link from "next/link";
import { AiOutlineFontSize } from "react-icons/ai";
import { IoEllipseOutline, IoSquareOutline, IoAdd, IoRemove, IoTextOutline } from "react-icons/io5";
import { PiPathLight, PiSidebarSimpleThin } from "react-icons/pi";
import { Color, LayerType } from "~/types";
import { colorToCss, connectionIdToColor, hexToRgb } from "~/utils";
import LayerButton from "./LayerButton";
import NumberInput from "./NumberInput";
import { BsCircleHalf, BsCheckSquare, BsCalendar, BsClock, BsList, BsSquare, BsPhone } from "react-icons/bs";
import { RiRoundedCorner } from "react-icons/ri";
import ColorPicker from "./ColorPicker";
import Dropdown from "./Dropdown";
import UserAvatar from "./UserAvatar";
import { User } from "@prisma/client";
import ShareMenu from "./ShareMenu";

export default function Sidebars({
  roomName,
  roomId,
  othersWithAccessToRoom,
  leftIsMinimized,
  setLeftIsMinimized,
}: {
  roomName: string;
  roomId: string;
  othersWithAccessToRoom: User[];
  leftIsMinimized: boolean;
  setLeftIsMinimized: (value: boolean) => void;
}) {
  const me = useSelf();
  const others = useOthers();

  const selectedLayer = useSelf((me) => {
    const selection = me.presence.selection;
    return selection.length === 1 ? selection[0] : null;
  });

  const layer = useStorage((root) => {
    if (!selectedLayer) {
      return null;
    }
    return root.layers.get(selectedLayer);
  });

  const roomColor = useStorage((root) => root.roomColor);

  const layers = useStorage((root) => root.layers);
  const layerIds = useStorage((root) => root.layerIds);
  const reversedLayerIds = [...(layerIds ?? [])].reverse();

  const selection = useSelf((me) => me.presence.selection);

  const setRoomColor = useMutation(({ storage }, newColor: Color) => {
    storage.set("roomColor", newColor);
  }, []);

  const updateLayer = useMutation(
    (
      { storage },
      updates: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        opacity?: number;
        cornerRadius?: number;
        fill?: string | Color;
        stroke?: string;
        fontSize?: number;
        fontWeight?: number;
        fontFamily?: string;
        placeholder?: string;
        textFill?: string | Color;
        text?: string;
        options?: string[];
        selectedOption?: string;
        label?: string;
        checked?: boolean;
        format?: string;
      },
    ) => {
      if (!selectedLayer) return;

      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(selectedLayer);

      if (layer) {
        layer.update({
          ...(updates.x !== undefined && { x: updates.x }),
          ...(updates.y !== undefined && { y: updates.y }),
          ...(updates.width !== undefined && { width: updates.width }),
          ...(updates.height !== undefined && { height: updates.height }),
          ...(updates.opacity !== undefined && { opacity: updates.opacity }),
          ...(updates.cornerRadius !== undefined && {
            cornerRadius: updates.cornerRadius,
          }),
          ...(updates.fill !== undefined && { 
            fill: typeof updates.fill === 'string' ? hexToRgb(updates.fill) : updates.fill 
          }),
          ...(updates.stroke !== undefined && {
            stroke: hexToRgb(updates.stroke),
          }),
          ...(updates.fontSize !== undefined && { fontSize: updates.fontSize }),
          ...(updates.fontWeight !== undefined && {
            fontWeight: updates.fontWeight,
          }),
          ...(updates.fontFamily !== undefined && {
            fontFamily: updates.fontFamily,
          }),
          ...(updates.placeholder !== undefined && {
            placeholder: updates.placeholder,
          }),
          ...(updates.textFill !== undefined && {
            textFill: typeof updates.textFill === 'string' ? hexToRgb(updates.textFill) : updates.textFill
          }),
          ...(updates.text !== undefined && {
            text: updates.text
          }),
          ...(updates.options !== undefined && {
            options: updates.options
          }),
          ...(updates.selectedOption !== undefined && {
            selectedOption: updates.selectedOption
          }),
          ...(updates.label !== undefined && {
            label: updates.label
          }),
          ...(updates.checked !== undefined && {
            checked: updates.checked
          }),
          ...(updates.format !== undefined && {
            format: updates.format
          }),
        });
      }
    },
    [selectedLayer],
  );

  return (
    <>
      {/* Left Sidebar */}
      {!leftIsMinimized ? (
        <div className="fixed left-0 flex h-screen w-[240px] flex-col border-r border-gray-200 bg-white">
          <div className="p-4">
            <div className="flex justify-between">
              <Link href="/dashboard">
                <img
                  src="/figma-logo.svg"
                  alt="Figma logo"
                  className="h-[18px w-[18px]"
                />
              </Link>
              <PiSidebarSimpleThin
                onClick={() => setLeftIsMinimized(true)}
                className="h-5 w-5 cursor-pointer"
              />
            </div>
            <h2 className="mt-2 scroll-m-20 text-[13px] font-medium">
              {roomName}
            </h2>
          </div>
          <div className="border-b border-gray-200" />
          <div className="flex flex-col gap-1 p-4 overflow-y-auto flex-1">
            <span className="mb-2 text-[11px] font-medium">Layers</span>
            {layerIds &&
              reversedLayerIds.map((id) => {
                const layer = layers?.get(id);
                const isSelected = selection?.includes(id);
                const isBackground = layer?.type === LayerType.Background;
                const hasParent = layer?.parentId !== undefined;

                if (hasParent && !isBackground) {
                  return null;
                }

                const renderLayer = (layerId: string, indent: number = 0) => {
                  const currentLayer = layers?.get(layerId);
                  const isCurrentSelected = selection?.includes(layerId);
                  const isCurrentBackground = currentLayer?.type === LayerType.Background;

                  const children = reversedLayerIds.filter(childId => {
                    const childLayer = layers?.get(childId);
                    return childLayer?.parentId === layerId;
                  });

                  const getLayerIcon = (type: LayerType) => {
                    switch (type) {
                      case LayerType.Rectangle:
                        return <IoSquareOutline className="h-3 w-3 text-gray-500" />;
                      case LayerType.Ellipse:
                        return <IoEllipseOutline className="h-3 w-3 text-gray-500" />;
                      case LayerType.Path:
                        return <PiPathLight className="h-3 w-3 text-gray-500" />;
                      case LayerType.Text:
                        return <AiOutlineFontSize className="h-3 w-3 text-gray-500" />;
                      case LayerType.Input:
                        return <IoTextOutline className="h-3 w-3 text-gray-500" />;
                      case LayerType.Button:
                        return <BsSquare className="h-3 w-3 text-gray-500" />;
                      case LayerType.Selector:
                        return <BsList className="h-3 w-3 text-gray-500" />;
                      case LayerType.Checkbox:
                        return <BsCheckSquare className="h-3 w-3 text-gray-500" />;
                      case LayerType.DatePicker:
                        return <BsCalendar className="h-3 w-3 text-gray-500" />;
                      case LayerType.TimePicker:
                        return <BsClock className="h-3 w-3 text-gray-500" />;
                      case LayerType.Background:
                        return <BsPhone className="h-3 w-3 text-blue-500" />;
                      default:
                        return null;
                    }
                  };

                  const getLayerText = (type: LayerType) => {
                    switch (type) {
                      case LayerType.Rectangle:
                        return isCurrentBackground ? "Background" : "Rectangle";
                      case LayerType.Ellipse:
                        return "Ellipse";
                      case LayerType.Path:
                        return "Drawing";
                      case LayerType.Text:
                        return "Text";
                      case LayerType.Input:
                        return "Input";
                      case LayerType.Button:
                        return "Button";
                      case LayerType.Selector:
                        return "Selector";
                      case LayerType.Checkbox:
                        return "Checkbox";
                      case LayerType.DatePicker:
                        return "Date Picker";
                      case LayerType.TimePicker:
                        return "Time Picker";
                      case LayerType.Background:
                        return "Background";
                      default:
                        return "";
                    }
                  };

                  return (
                    <div key={layerId} className="flex flex-col">
                      <div style={{ paddingLeft: `${indent * 16}px` }}>
                        <LayerButton
                          layerId={layerId}
                          text={getLayerText(currentLayer?.type ?? LayerType.Rectangle)}
                          isSelected={isCurrentSelected ?? false}
                          icon={getLayerIcon(currentLayer?.type ?? LayerType.Rectangle)}
                        />
                      </div>
                      {children.map(childId => renderLayer(childId, indent + 1))}
                    </div>
                  );
                };

                return renderLayer(id);
              })}
          </div>
        </div>
      ) : (
        <div className="fixed left-3 top-3 flex h-[48px] w-[250px] items-center justify-between rounded-xl border bg-white p-4">
          <Link href="/dashboard">
            <img
              src="/figma-logo.svg"
              alt="Figma logo"
              className="h-[18px w-[18px]"
            />
          </Link>
          <h2 className="scroll-m-20 text-[13px] font-medium">{roomName}</h2>
          <PiSidebarSimpleThin
            onClick={() => setLeftIsMinimized(false)}
            className="h-5 w-5 cursor-pointer"
          />
        </div>
      )}

      {/* Right Sidebar */}
      {!leftIsMinimized || layer ? (
        <div
          className={`fixed ${leftIsMinimized && layer ? "bottom-3 right-3 top-3 rounded-xl" : ""} ${!leftIsMinimized && !layer ? "h-screen" : ""} ${!leftIsMinimized && layer ? "bottom-0 top-0 h-screen" : ""} right-0 flex w-[260px] flex-col border-l border-gray-200 bg-white`}
        >
          <div className="flex items-center justify-between pr-2">
            <div className="max-36 flex w-full gap-2 overflow-x-scroll p-3 text-xs">
              {me && (
                <UserAvatar
                  color={connectionIdToColor(me.connectionId)}
                  name={me.info.name}
                />
              )}
              {others.map((other) => (
                <UserAvatar
                  key={other.connectionId}
                  color={connectionIdToColor(other.connectionId)}
                  name={other.info.name}
                />
              ))}
            </div>
            <ShareMenu
              roomId={roomId}
              othersWithAccessToRoom={othersWithAccessToRoom}
            />
          </div>
          <div className="border-b border-gray-200"></div>
          <div className="overflow-y-auto flex-1">
            {layer ? (
              <>
                <div className="flex flex-col gap-2 p-4">
                  <span className="mb-2 text-[11px] font-medium">Position</span>
                  <div className="flex flex-col gap-1">
                    <p className="text-[9px] font-medium text-gray-500">
                      Position
                    </p>
                    <div className="flex w-full gap-2">
                      <NumberInput
                        value={layer.x}
                        onChange={(number) => {
                          updateLayer({ x: number });
                        }}
                        classNames="w-1/2"
                        icon={<p>X</p>}
                      />
                      <NumberInput
                        value={layer.y}
                        onChange={(number) => {
                          updateLayer({ y: number });
                        }}
                        classNames="w-1/2"
                        icon={<p>Y</p>}
                      />
                    </div>
                  </div>
                </div>

                {layer.type !== LayerType.Path && (
                  <>
                    <div className="border-b border-gray-200"></div>
                    <div className="flex flex-col gap-2 p-4">
                      <span className="mb-2 text-[11px] font-medium">Layout</span>
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-medium text-gray-500">
                          Dimensions
                        </p>
                        <div className="flex w-full gap-2">
                          <NumberInput
                            value={layer.width}
                            onChange={(number) => {
                              updateLayer({ width: number });
                            }}
                            classNames="w-1/2"
                            icon={<p>W</p>}
                          />
                          <NumberInput
                            value={layer.height}
                            onChange={(number) => {
                              updateLayer({ height: number });
                            }}
                            classNames="w-1/2"
                            icon={<p>H</p>}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="border-b border-gray-200"></div>
                <div className="flex flex-col gap-2 p-4">
                  <span className="mb-2 text-[11px] font-medium">Appearance</span>
                  <div className="flex w-full gap-2">
                    <div className="flex w-1/2 flex-col gap-1">
                      <p className="text-[9px] font-medium text-gray-500">
                        Opacity
                      </p>
                      <NumberInput
                        value={layer.opacity}
                        min={0}
                        max={100}
                        onChange={(number) => {
                          updateLayer({ opacity: number });
                        }}
                        classNames="w-full"
                        icon={<BsCircleHalf />}
                      />
                    </div>
                    {layer.type === LayerType.Rectangle && (
                      <div className="flex w-1/2 flex-col gap-1">
                        <p className="text-[9px] font-medium text-gray-500">
                          Corner radius
                        </p>
                        <NumberInput
                          value={layer.cornerRadius ?? 0}
                          min={0}
                          max={100}
                          onChange={(number) => {
                            updateLayer({ cornerRadius: number });
                          }}
                          classNames="w-full"
                          icon={<RiRoundedCorner />}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-b border-gray-200" />
                <div className="flex flex-col gap-2 p-4">
                  <span className="mb-2 text-[11px] font-medium">Fill</span>
                  <ColorPicker
                    value={colorToCss(layer.fill)}
                    onChange={(color) => {
                      updateLayer({ fill: color, stroke: color });
                    }}
                  />
                </div>
                <div className="border-b border-gray-200" />
                <div className="flex flex-col gap-2 p-4">
                  <span className="mb-2 text-[11px] font-medium">Stroke</span>
                  <ColorPicker
                    value={colorToCss(layer.stroke)}
                    onChange={(color) => {
                      updateLayer({ stroke: color });
                    }}
                  />
                </div>
                {layer.type === LayerType.Text && (
                  <>
                    <div className="border-b border-gray-200" />
                    <div className="flex flex-col gap-2 p-4">
                      <span className="mb-2 text-[11px] font-medium">
                        Typography
                      </span>
                      <div className="flex flex-col gap-2">
                        <Dropdown
                          value={layer.fontFamily}
                          onChange={(value) => {
                            updateLayer({ fontFamily: value });
                          }}
                          options={["Inter", "Arial", "Times New Roman"]}
                        />
                        <div className="flex w-full gap-2">
                          <div className="flex w-full flex-col gap-1">
                            <p className="text-[9px] font-medium text-gray-500">
                              Size
                            </p>
                            <NumberInput
                              value={layer.fontSize}
                              onChange={(number) => {
                                updateLayer({ fontSize: number });
                              }}
                              classNames="w-full"
                              icon={<p>W</p>}
                            />
                          </div>
                          <div className="flex w-full flex-col gap-1">
                            <p className="text-[9px] font-medium text-gray-500">
                              Weight
                            </p>
                            <Dropdown
                              value={(layer.fontWeight ?? 400).toString()}
                              onChange={(value) => {
                                updateLayer({ fontWeight: Number(value) });
                              }}
                              options={[
                                "100",
                                "200",
                                "300",
                                "400",
                                "500",
                                "600",
                                "700",
                                "800",
                                "900",
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {layer.type === LayerType.Input && (
                  <>
                    <div className="border-b border-gray-200" />
                    <div className="flex flex-col gap-2 p-4">
                      <span className="mb-2 text-[11px] font-medium">
                        Text Properties
                      </span>
                      <div className="flex flex-col gap-2">
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Text Style
                          </p>
                          <div className="flex flex-col gap-2">
                            <Dropdown
                              value={layer.fontFamily || "Inter"}
                              onChange={(value) => {
                                updateLayer({ fontFamily: value });
                              }}
                              options={["Inter", "Arial", "Times New Roman"]}
                            />
                            <div className="flex w-full gap-2">
                              <div className="flex w-full flex-col gap-1">
                                <p className="text-[9px] font-medium text-gray-500">
                                  Size
                                </p>
                                <NumberInput
                                  value={layer.fontSize || 14}
                                  onChange={(number) => {
                                    updateLayer({ fontSize: number });
                                  }}
                                  classNames="w-full"
                                  icon={<p>W</p>}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Text Color
                          </p>
                          <ColorPicker
                            value={colorToCss(layer.textFill)}
                            onChange={(color) => {
                              updateLayer({ textFill: hexToRgb(color) });
                            }}
                          />
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Placeholder
                          </p>
                          <input
                            type="text"
                            value={layer.placeholder || ""}
                            onChange={(e) => {
                              updateLayer({ placeholder: e.target.value });
                            }}
                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                            placeholder="Enter placeholder text..."
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {layer.type === LayerType.Button && (
                  <>
                    <div className="border-b border-gray-200" />
                    <div className="flex flex-col gap-2 p-4">
                      <span className="mb-2 text-[11px] font-medium">
                        Text Properties
                      </span>
                      <div className="flex flex-col gap-2">
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Text Style
                          </p>
                          <div className="flex flex-col gap-2">
                            <Dropdown
                              value={layer.fontFamily || "Inter"}
                              onChange={(value) => {
                                updateLayer({ fontFamily: value });
                              }}
                              options={["Inter", "Arial", "Times New Roman"]}
                            />
                            <div className="flex w-full gap-2">
                              <div className="flex w-full flex-col gap-1">
                                <p className="text-[9px] font-medium text-gray-500">
                                  Size
                                </p>
                                <NumberInput
                                  value={layer.fontSize || 14}
                                  onChange={(number) => {
                                    updateLayer({ fontSize: number });
                                  }}
                                  classNames="w-full"
                                  icon={<p>W</p>}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Text Color
                          </p>
                          <ColorPicker
                            value={colorToCss(layer.textFill)}
                            onChange={(color) => {
                              updateLayer({ textFill: hexToRgb(color) });
                            }}
                          />
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Button Text
                          </p>
                          <input
                            type="text"
                            value={layer.text || ""}
                            onChange={(e) => {
                              updateLayer({ text: e.target.value });
                            }}
                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                            placeholder="Enter button text..."
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {layer.type === LayerType.Selector && (
                  <>
                    <div className="border-b border-gray-200" />
                    <div className="flex flex-col gap-2 p-4">
                      <span className="mb-2 text-[11px] font-medium">
                        Text Properties
                      </span>
                      <div className="flex flex-col gap-2">
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Text Style
                          </p>
                          <div className="flex flex-col gap-2">
                            <Dropdown
                              value={layer.fontFamily || "Inter"}
                              onChange={(value) => {
                                updateLayer({ fontFamily: value });
                              }}
                              options={["Inter", "Arial", "Times New Roman"]}
                            />
                            <div className="flex w-full gap-2">
                              <div className="flex w-full flex-col gap-1">
                                <p className="text-[9px] font-medium text-gray-500">
                                  Size
                                </p>
                                <NumberInput
                                  value={layer.fontSize || 14}
                                  onChange={(number) => {
                                    updateLayer({ fontSize: number });
                                  }}
                                  classNames="w-full"
                                  icon={<p>W</p>}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Text Color
                          </p>
                          <ColorPicker
                            value={colorToCss(layer.textFill)}
                            onChange={(color) => {
                              updateLayer({ textFill: hexToRgb(color) });
                            }}
                          />
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Options
                          </p>
                          <div className="flex flex-col gap-2">
                            {layer.options.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...layer.options];
                                    newOptions[index] = e.target.value;
                                    updateLayer({ options: newOptions });
                                  }}
                                  className="flex-1 rounded border border-gray-200 px-2 py-1 text-sm"
                                  placeholder={`Option ${index + 1}`}
                                />
                                <button
                                  onClick={() => {
                                    const newOptions = layer.options.filter((_, i) => i !== index);
                                    updateLayer({ 
                                      options: newOptions,
                                      selectedOption: layer.selectedOption === option ? newOptions[0] : layer.selectedOption
                                    });
                                  }}
                                  className="rounded p-1 text-gray-500 hover:bg-red-100 hover:text-red-500"
                                  title="Remove option"
                                >
                                  <IoRemove className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newOptions = [...layer.options, `Option ${layer.options.length + 1}`];
                                updateLayer({ options: newOptions });
                              }}
                              className="flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-sm text-gray-500 hover:bg-gray-50"
                            >
                              <IoAdd className="h-4 w-4" />
                              <span>Add Option</span>
                            </button>
                          </div>
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Selected Option
                          </p>
                          <select
                            value={layer.selectedOption || layer.options[0] || ""}
                            onChange={(e) => {
                              updateLayer({ selectedOption: e.target.value });
                            }}
                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                          >
                            {layer.options.map((option, index) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {layer.type === LayerType.Checkbox && (
                  <>
                    <div className="border-b border-gray-200" />
                    <div className="flex flex-col gap-2 p-4">
                      <span className="mb-2 text-[11px] font-medium">
                        Text Properties
                      </span>
                      <div className="flex flex-col gap-2">
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Text Style
                          </p>
                          <div className="flex flex-col gap-2">
                            <Dropdown
                              value={layer.fontFamily || "Inter"}
                              onChange={(value) => {
                                updateLayer({ fontFamily: value });
                              }}
                              options={["Inter", "Arial", "Times New Roman"]}
                            />
                            <div className="flex w-full gap-2">
                              <div className="flex w-full flex-col gap-1">
                                <p className="text-[9px] font-medium text-gray-500">
                                  Size
                                </p>
                                <NumberInput
                                  value={layer.fontSize || 14}
                                  onChange={(number) => {
                                    updateLayer({ fontSize: number });
                                  }}
                                  classNames="w-full"
                                  icon={<p>W</p>}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Text Color
                          </p>
                          <ColorPicker
                            value={colorToCss(layer.textFill)}
                            onChange={(color) => {
                              updateLayer({ textFill: hexToRgb(color) });
                            }}
                          />
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Label
                          </p>
                          <input
                            type="text"
                            value={layer.label || ""}
                            onChange={(e) => {
                              updateLayer({ label: e.target.value });
                            }}
                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                            placeholder="Enter checkbox label..."
                          />
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Checkbox State
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={layer.checked}
                              onChange={(e) => {
                                updateLayer({ checked: e.target.checked });
                              }}
                              className="h-4 w-4 rounded border border-gray-200"
                            />
                            <span className="text-sm">Checked</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {layer.type === LayerType.DatePicker && (
                  <>
                    <div className="border-b border-gray-200" />
                    <div className="flex flex-col gap-2 p-4">
                      <span className="mb-2 text-[11px] font-medium">
                        Text Properties
                      </span>
                      <div className="flex flex-col gap-2">
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Text Style
                          </p>
                          <div className="flex flex-col gap-2">
                            <Dropdown
                              value={layer.fontFamily || "Inter"}
                              onChange={(value) => {
                                updateLayer({ fontFamily: value });
                              }}
                              options={["Inter", "Arial", "Times New Roman"]}
                            />
                            <div className="flex w-full gap-2">
                              <div className="flex w-full flex-col gap-1">
                                <p className="text-[9px] font-medium text-gray-500">
                                  Size
                                </p>
                                <NumberInput
                                  value={layer.fontSize || 14}
                                  onChange={(number) => {
                                    updateLayer({ fontSize: number });
                                  }}
                                  classNames="w-full"
                                  icon={<p>W</p>}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Text Color
                          </p>
                          <ColorPicker
                            value={colorToCss(layer.textFill)}
                            onChange={(color) => {
                              updateLayer({ textFill: hexToRgb(color) });
                            }}
                          />
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Placeholder
                          </p>
                          <input
                            type="text"
                            value={layer.placeholder || ""}
                            onChange={(e) => {
                              updateLayer({ placeholder: e.target.value });
                            }}
                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                            placeholder="Enter placeholder text..."
                          />
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Date Format
                          </p>
                          <Dropdown
                            value={layer.format || "YYYY-MM-DD"}
                            onChange={(value) => {
                              updateLayer({ format: value });
                            }}
                            options={["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY/MM/DD"]}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {layer.type === LayerType.TimePicker && (
                  <>
                    <div className="border-b border-gray-200" />
                    <div className="flex flex-col gap-2 p-4">
                      <span className="mb-2 text-[11px] font-medium">
                        Text Properties
                      </span>
                      <div className="flex flex-col gap-2">
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Text Style
                          </p>
                          <div className="flex flex-col gap-2">
                            <Dropdown
                              value={layer.fontFamily || "Inter"}
                              onChange={(value) => {
                                updateLayer({ fontFamily: value });
                              }}
                              options={["Inter", "Arial", "Times New Roman"]}
                            />
                            <div className="flex w-full gap-2">
                              <div className="flex w-full flex-col gap-1">
                                <p className="text-[9px] font-medium text-gray-500">
                                  Size
                                </p>
                                <NumberInput
                                  value={layer.fontSize || 14}
                                  onChange={(number) => {
                                    updateLayer({ fontSize: number });
                                  }}
                                  classNames="w-full"
                                  icon={<p>W</p>}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Text Color
                          </p>
                          <ColorPicker
                            value={colorToCss(layer.textFill)}
                            onChange={(color) => {
                              updateLayer({ textFill: hexToRgb(color) });
                            }}
                          />
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Placeholder
                          </p>
                          <input
                            type="text"
                            value={layer.placeholder || ""}
                            onChange={(e) => {
                              updateLayer({ placeholder: e.target.value });
                            }}
                            className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                            placeholder="Enter placeholder text..."
                          />
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Time Format
                          </p>
                          <Dropdown
                            value={layer.format || "HH:mm"}
                            onChange={(value) => {
                              updateLayer({ format: value });
                            }}
                            options={["HH:mm", "hh:mm A", "HH:mm:ss"]}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2 p-4">
                <span className="mb-2 text-[11px] font-medium">Page</span>
                <ColorPicker
                  onChange={(color) => {
                    const rgbColor = hexToRgb(color);
                    setRoomColor(rgbColor);
                  }}
                  value={roomColor ? colorToCss(roomColor) : "#1e1e1e"}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="fixed right-3 top-3 flex h-[48px] w-[250px] items-center justify-between rounded-xl border bg-white pr-2">
          <div className="max-36 flex w-full gap-2 overflow-x-scroll p-3 text-xs">
            {me && (
              <UserAvatar
                color={connectionIdToColor(me.connectionId)}
                name={me.info.name}
              />
            )}
            {others.map((other) => (
              <UserAvatar
                key={other.connectionId}
                color={connectionIdToColor(other.connectionId)}
                name={other.info.name}
              />
            ))}
          </div>
          <ShareMenu
            roomId={roomId}
            othersWithAccessToRoom={othersWithAccessToRoom}
          />
        </div>
      )}
    </>
  );
}
