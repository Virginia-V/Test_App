"use client"
import React, { JSX } from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import * as THREE from "three";
import { IMAGES_3D } from "@/lib";

type GLTFResult = GLTF & {
  nodes: {
    ["3D_LOGO_ARMCHAIR001_1"]: THREE.Mesh;
    ["3D_LOGO_ARMCHAIR001_2"]: THREE.Mesh;
  };
  materials: {
    BLACK: THREE.Material;
    WHITE: THREE.Material;
  };
};

type FloorHotspot02Props = JSX.IntrinsicElements["group"] & {
  scale?: number;
};

export function FloorHotspot_02({ scale = 1, ...props }: FloorHotspot02Props) {
  const { nodes, materials } = useGLTF(
    IMAGES_3D.Floor_3D_Hotspot_02
  ) as unknown as GLTFResult;
  return (
    <group {...props} dispose={null} scale={[scale, scale, scale]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["3D_LOGO_ARMCHAIR001_1"].geometry}
        material={materials.BLACK}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["3D_LOGO_ARMCHAIR001_2"].geometry}
        material={materials.WHITE}
      />
    </group>
  );
}

useGLTF.preload(IMAGES_3D.Floor_3D_Hotspot_02);
