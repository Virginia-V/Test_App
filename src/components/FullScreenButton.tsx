"use client";
import React from "react";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FullScreenButtonProps {
  handle: {
    active: boolean;
    enter: () => void;
    exit: () => void;
  };
  position?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  className?: string;
}

export const FullScreenButton: React.FC<FullScreenButtonProps> = ({
  handle,
  position = {},
  className
}) => {
  const handleClick = () => {
    if (handle.active) {
      handle.exit();
    } else {
      handle.enter();
    }
  };

  const positionClasses = [
    position.top !== undefined && `top-[${position.top}px]`,
    position.bottom !== undefined && `bottom-[${position.bottom}px]`,
    position.left !== undefined && `left-[${position.left}px]`,
    position.right !== undefined && `right-[${position.right}px]`
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label="Toggle Fullscreen"
      className={cn(
        "absolute z-10 w-12 h-12 bg-black/40 text-white hover:bg-black/60 cursor-pointer",
        positionClasses,
        className
      )}
      style={position}
    >
      {handle.active ? (
        <FullscreenExitIcon sx={{ color: "var(--icon-color)" }} />
      ) : (
        <FullscreenIcon sx={{ color: "var(--icon-color)" }} />
      )}
    </Button>
  );
};
