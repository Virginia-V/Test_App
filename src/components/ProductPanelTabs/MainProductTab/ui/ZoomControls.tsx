import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RefreshIcon from "@mui/icons-material/Refresh";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import { Icon360 } from "@/assets/svg/Icon360";
import { Icon2D } from "@/assets/svg/Icon2D";

const TwoDIcon = () => (
  <span className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-current cursor-pointer">
    2D
  </span>
);

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  show3D: boolean;
  onToggle3D: () => void;
  show360: boolean;
  show2D: boolean;
  onToggle360: () => void;
  onToggle2D: () => void;
}

const buttonBase =
  "flex items-center justify-center rounded-lg cursor-pointer transition-all duration-150";

const iconButton = `${buttonBase} h-11 w-11 text-white px-0`;

const resetButton = `${buttonBase} h-11 min-h-11 px-3 gap-1 text-black border border-gray-300 bg-white hover:bg-gray-100`;

const toggleButton = `${buttonBase} h-11 w-11 bg-[#DDD] text-black`;

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  show3D,
  onToggle3D,
  onToggle2D,
  show2D,
  show360,
  onToggle360
}) => (
  <div className="flex flex-row gap-3 items-center">
    <Button
      size="icon"
      onClick={onZoomIn}
      className={`${iconButton} bg-[var(--color-caramel)] hover:bg-[var(--color-caramel)]`}
      aria-label="Zoom In"
    >
      <ZoomInIcon fontSize="small" />
    </Button>

    <Button
      size="icon"
      onClick={onZoomOut}
      className={`${iconButton} bg-[var(--color-wood)] hover:bg-[var(--color-wood)]`}
      aria-label="Zoom Out"
    >
      <ZoomOutIcon fontSize="small" />
    </Button>

    <Button
      variant="outline"
      size="sm"
      onClick={onReset}
      className={resetButton}
      aria-label="Reset"
    >
      <RefreshIcon fontSize="small" />
      <span>Reset</span>
    </Button>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle360}
          className="bg-white hover:bg-gray-100 text-black"
          aria-label={show360 ? "Hide 360° View" : "Show 360° View"}
        >
          <Icon360 />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {show360 ? "Hide 360° View" : "Show 360° View"}
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle2D}
          className="bg-white hover:bg-gray-100 text-black"
          aria-label={show2D ? "Hide 2D View" : "Show 2D View"}
        >
          <Icon2D />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {show2D ? "Hide 2D View" : "Show 2D View"}
      </TooltipContent>
    </Tooltip>
  </div>
);
