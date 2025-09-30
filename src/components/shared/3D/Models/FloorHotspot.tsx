"use client";
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type FloorHotspotProps = {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  opacity?: number;
  animated?: boolean;
  onClick?: (e: THREE.Event) => void;
};

export function FloorHotspot({
  position = [0, 0, 0],
  scale = 1,
  color = "#00ffff",
  opacity = 0.7,
  animated = true,
  onClick,
  ...props
}: FloorHotspotProps) {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerCircleRef = useRef<THREE.Mesh>(null);
  const centerDotRef = useRef<THREE.Mesh>(null);

  const outerRingGeometry = useMemo(
    () => new THREE.RingGeometry(0.8, 1.0, 64),
    []
  );
  const innerCircleGeometry = useMemo(
    () => new THREE.CircleGeometry(0.6, 64),
    []
  );
  const centerDotGeometry = useMemo(
    () => new THREE.CircleGeometry(0.1, 32),
    []
  );

  const ringMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: opacity * 0.8,
        side: THREE.DoubleSide,
        alphaTest: 0.001,
        depthWrite: false
      }),
    [color, opacity]
  );

  const circleMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: opacity * 0.3,
        side: THREE.DoubleSide,
        alphaTest: 0.001,
        depthWrite: false
      }),
    [color, opacity]
  );

  const dotMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
        alphaTest: 0.001,
        depthWrite: false
      }),
    [color, opacity]
  );

  useFrame((state) => {
    if (animated && outerRingRef.current && innerCircleRef.current) {
      const time = state.clock.getElapsedTime();

      outerRingRef.current.rotation.z = time * 0.3;
      const pulseScale = 1 + Math.sin(time * 1.5) * 0.05;
      innerCircleRef.current.scale.set(pulseScale, pulseScale, 1);

      if (centerDotRef.current) {
        const dotPulse = 1 + Math.sin(time * 2) * 0.1;
        centerDotRef.current.scale.set(dotPulse, dotPulse, 1);
      }
    }
  });

  return (
    <group
      position={position}
      scale={[scale, scale, scale]}
      onClick={onClick}
      {...props}
    >
      <mesh
        ref={outerRingRef}
        geometry={outerRingGeometry}
        material={ringMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={1}
      />

      <mesh
        ref={innerCircleRef}
        geometry={innerCircleGeometry}
        material={circleMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        renderOrder={2}
      />

      <mesh
        ref={centerDotRef}
        geometry={centerDotGeometry}
        material={dotMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        renderOrder={3}
      />
    </group>
  );
}
