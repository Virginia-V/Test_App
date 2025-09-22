"use client";
import { easeIn, easeOut } from "framer-motion";

export const MIN_DISTANCE = 10;
export const MAX_DISTANCE = 450;
export const ZOOM_STEP = 25;



export const variants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.98,
    pointerEvents: "none",
    transition: {
      duration: 0.14,
      ease: easeIn,
      type: "tween" as const
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    pointerEvents: "auto",
    transition: {
      duration: 0.18,
      ease: easeOut,
      type: "tween" as const
    }
  },
  exit: {
    opacity: 0,
    y: 60,
    scale: 0.98,
    pointerEvents: "none",
    transition: {
      duration: 0.14,
      ease: easeIn,
      type: "tween" as const
    }
  }
};
