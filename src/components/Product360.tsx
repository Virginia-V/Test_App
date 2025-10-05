import React from "react";
import { ReactImageTurntable } from "react-image-turntable";

export default function Product360() {
  const images = Array.from(
    { length: 60 },
    (_, i) => `360-images/BATH_B_${String(i + 1).padStart(4, "0")}.jpg`
  );

  return (
    <ReactImageTurntable
      images={images}
      initialImageIndex={0}
      movementSensitivity={0.5}
      autoRotate={{ disabled: true, interval: 1000 }}
    />
  );
}
