import React from "react";
import { ReactImageTurntable } from "react-image-turntable";

export default function Product360() {
  const images = Array.from(
    { length: 120 },
    (_, i) => `360-images-1/BATH_A_${String(i + 1).padStart(4, "0")}.jpg`
  );

  return (
    <ReactImageTurntable
      images={images}
      initialImageIndex={0}
      movementSensitivity={0.5}
      autoRotate={{ disabled: false, interval: 1000 }}
    />
  );
}
