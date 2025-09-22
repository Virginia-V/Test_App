import React from "react";
import * as THREE from "three";

export function sphericalToCartesian(
  radius: number,
  yaw: number,
  pitch: number
): [number, number, number] {
  const x = radius * Math.cos(pitch) * Math.sin(yaw);
  const y = radius * Math.sin(pitch);
  const z = radius * Math.cos(pitch) * Math.cos(yaw);
  return [x, y, z];
}

export function cartesianToSpherical(position: THREE.Vector3): {
  yaw: number;
  pitch: number;
} {
  const pos = position.clone().normalize();
  const yaw = Math.atan2(pos.x, pos.z);
  const pitch = Math.asin(pos.y);
  return { yaw, pitch };
}

type HotspotProps = {
  radius: number;
  yaw: number;
  pitch: number;
  onClick?: () => void;
  color?: string;
};

// export const Hotspot: React.FC<HotspotProps> = ({
//   radius,
//   yaw,
//   pitch,
//   onClick,
//   color = "red"
// }) => {
//   const position = sphericalToCartesian(radius-1, yaw, pitch);

//   return (
//     <mesh position={position} onClick={onClick}>
//       <sphereGeometry args={[500, 100, 100]} />
//       <meshBasicMaterial color={color} />
//     </mesh>
//   );
// };

export const toScreenPosition = (
  position: THREE.Vector3,
  camera: THREE.Camera,
  canvas: HTMLCanvasElement
) => {
  const vector = position.clone().project(camera);
  const x = (vector.x * 0.5 + 0.5) * canvas.clientWidth;
  const y = (-vector.y * 0.5 + 0.5) * canvas.clientHeight;
  return { x, y };
};
