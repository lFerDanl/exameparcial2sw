import { CanvasMode } from "~/types";
import IconButton from "./IconButton";
import { RiHand } from "react-icons/ri";

export default function HandToolButton({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <IconButton isActive={isActive} onClick={onClick}>
      <RiHand className="h-5 w-5" />
    </IconButton>
  );
} 