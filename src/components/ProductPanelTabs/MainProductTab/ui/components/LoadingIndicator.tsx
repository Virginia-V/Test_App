import React from "react";
import CircularProgress from "@mui/material/CircularProgress";

interface LoadingIndicatorProps {
  size?: number;
  thickness?: number;
  className?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 48,
  thickness = 5,
  className = "absolute inset-0 flex items-center justify-center z-10"
}) => (
  <div className={className}>
    <CircularProgress
      size={size}
      thickness={thickness}
      sx={{
        color: "var(--color-caramel)"
      }}
    />
  </div>
);