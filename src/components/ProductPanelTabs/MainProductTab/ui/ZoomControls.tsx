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
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { Icon2D } from "@/assets/svg/Icon2D";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggle2D: () => void;
  onCamera: () => void; // ✅ Add camera handler
}

const buttonBase =
  "flex items-center justify-center rounded-lg cursor-pointer transition-all duration-150";

const iconButton = `${buttonBase} h-11 w-11 text-white px-0`;

const resetButton = `${buttonBase} h-11 min-h-11 px-3 gap-1 text-black border border-gray-300 bg-white hover:bg-gray-100`;

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onToggle2D,
  onCamera // ✅ Add camera prop
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
          onClick={onToggle2D}
          className="bg-white hover:bg-gray-100 text-black cursor-pointer"
          aria-label="Show 2D View"
        >
          <Icon2D />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">Show 2D View</TooltipContent>
    </Tooltip>

    {/* ✅ Camera button with actual functionality */}
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCamera} // ✅ Use the camera handler
          className="bg-white hover:bg-gray-100 text-black cursor-pointer"
          aria-label="Camera"
        >
          <CameraAltIcon fontSize="small" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">View Bathtub Images</TooltipContent>
    </Tooltip>
  </div>
);
