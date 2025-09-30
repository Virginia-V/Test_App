"use client";
import React, { JSX } from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import * as THREE from "three";
import { IMAGES_3D } from "@/lib";

type GLTFResult = GLTF & {
  nodes: {
    ["3D_LOGO_ARMCHAIR_1"]: THREE.Mesh;
    ["3D_LOGO_ARMCHAIR_2"]: THREE.Mesh;
  };
  materials: {
    BLACK: THREE.Material;
    WHITE: THREE.Material;
  };
};

type ChairHotspotProps = JSX.IntrinsicElements["group"] & {
  scale?: number;
};

export function ChairHotspot({ scale = 1, ...props }: ChairHotspotProps) {
  const hotspotLogo = IMAGES_3D.Armchair_3D_Hotspot;
  const { nodes, materials } = useGLTF(hotspotLogo) as unknown as GLTFResult;

  // Adjust texture settings
  const blackMaterial = materials.BLACK as THREE.MeshStandardMaterial;
  const whiteMaterial = materials.WHITE as THREE.MeshStandardMaterial;

  if (blackMaterial.map) {
    blackMaterial.map.generateMipmaps = false;
    blackMaterial.map.minFilter = THREE.LinearFilter;
    blackMaterial.map.magFilter = THREE.LinearFilter;
  }

  if (whiteMaterial.map) {
    whiteMaterial.map.generateMipmaps = false;
    whiteMaterial.map.minFilter = THREE.LinearFilter;
    whiteMaterial.map.magFilter = THREE.LinearFilter;
  }

  return (
    <group {...props} dispose={null} scale={[scale, scale, scale]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["3D_LOGO_ARMCHAIR_1"].geometry}
        material={blackMaterial}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["3D_LOGO_ARMCHAIR_2"].geometry}
        material={whiteMaterial}
      />
    </group>
  );
}

useGLTF.preload(IMAGES_3D.Armchair_3D_Hotspot);
