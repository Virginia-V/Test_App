"use client"
import React, { JSX, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import * as THREE from "three";
import { IMAGES_3D } from "@/lib";

type GLTFResult = GLTF & {
  nodes: {
    ["3D_LOGO_ARMCHAIR002_1"]: THREE.Mesh;
    ["3D_LOGO_ARMCHAIR002_2"]: THREE.Mesh;
  };
  materials: {
    BLACK: THREE.Material;
    WHITE: THREE.Material;
  };
};

type SinkHotspotProps = JSX.IntrinsicElements["group"] & {
  scale?: number;
};

export function SinkHotspot({ scale = 1, ...props }: SinkHotspotProps) {
  const { nodes, materials } = useGLTF(
    IMAGES_3D.Sink_3D_Hotspot
  ) as unknown as GLTFResult;

  // Robust material handling: ensure visibility even if GLTF materials are not PBR
  const blackMat = useMemo<THREE.Material>(() => {
    const m: THREE.Material = materials.BLACK;
    if (m instanceof THREE.MeshStandardMaterial) {
      const std = m;
      std.color = new THREE.Color("#111111");
      std.metalness = 0.2;
      std.roughness = 0.6;
      std.envMapIntensity = 1.5;
      std.toneMapped = true;
      std.needsUpdate = true;
      return std;
    }
    return new THREE.MeshBasicMaterial({ color: "#111111" });
  }, [materials.BLACK]);

  const whiteMat = useMemo<THREE.Material>(() => {
    const m: THREE.Material = materials.WHITE;
    if (m instanceof THREE.MeshStandardMaterial) {
      const std = m;
      std.color = new THREE.Color("#ffffff");
      std.metalness = 0.05;
      std.roughness = 0.4;
      std.envMapIntensity = 1.5;
      std.emissive = new THREE.Color("#ffffff");
      std.emissiveIntensity = 0.04;
      std.toneMapped = true;
      std.needsUpdate = true;
      return std;
    }
    return new THREE.MeshBasicMaterial({ color: "#ffffff" });
  }, [materials.WHITE]);

  return (
    <group {...props} dispose={null} scale={[scale, scale, scale]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["3D_LOGO_ARMCHAIR002_1"].geometry}
        material={blackMat}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes["3D_LOGO_ARMCHAIR002_2"].geometry}
        material={whiteMat}
      />
    </group>
  );
}

useGLTF.preload(IMAGES_3D.Sink_3D_Hotspot);
