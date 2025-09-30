"use client";
import React, { JSX } from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import * as THREE from "three";
import { IMAGES_3D } from "@/lib";

type GLTFResult = GLTF & {
  nodes: {
    ["3D_LOGO_ARMCHAIR003_1"]: THREE.Mesh;
    ["3D_LOGO_ARMCHAIR003_2"]: THREE.Mesh;
  };
  materials: {
    BLACK: THREE.Material;
    WHITE: THREE.Material;
  };
};

type BathtubHotspotProps = JSX.IntrinsicElements["group"] & {
  scale?: number;
};

export function BathtubHotspot({ scale = 1, ...props }: BathtubHotspotProps) {
  const { nodes, materials } = useGLTF(
    IMAGES_3D.Bathtub_3D_Hotspot
  ) as unknown as GLTFResult;

  // Normalize GLTF materials so they are properly lit by IBL + lights
  const black = materials.BLACK as unknown as
    | THREE.MeshStandardMaterial
    | undefined;
  const white = materials.WHITE as unknown as
    | THREE.MeshStandardMaterial
    | undefined;

  if (black) {
    black.color = new THREE.Color("#111111");
    black.metalness = 0.2;
    black.roughness = 0.6;
    black.envMapIntensity = 1.25;
    black.toneMapped = true;
  }
  if (white) {
    white.color = new THREE.Color("#ffffff");
    white.metalness = 0.05;
    white.roughness = 0.4;
    white.envMapIntensity = 1.25;
    white.emissive = new THREE.Color("#ffffff");
    white.emissiveIntensity = 0.03;
    white.toneMapped = true;
  }

  return (
    <group {...props} dispose={null} scale={[scale, scale, scale]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["3D_LOGO_ARMCHAIR003_1"].geometry}
        material={materials.BLACK}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["3D_LOGO_ARMCHAIR003_2"].geometry}
        material={materials.WHITE}
      />
    </group>
  );
}

useGLTF.preload(IMAGES_3D.Bathtub_3D_Hotspot);
