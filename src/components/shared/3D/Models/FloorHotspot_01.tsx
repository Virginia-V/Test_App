"use client";
import React, { JSX } from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { Mesh, Material } from "three";
import { IMAGES_3D } from "@/lib";

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: Mesh;
    Line031: Mesh;
    Line032: Mesh;
    Line033: Mesh;
    Line034: Mesh;
    Line035: Mesh;
    Line036: Mesh;
    Line037: Mesh;
    Line038: Mesh;
    Line040: Mesh;
    Line041: Mesh;
    Line042: Mesh;
    Line043: Mesh;
    Line044: Mesh;
    Line045: Mesh;
    Line046: Mesh;
    Line047: Mesh;
    Line049: Mesh;
    Line050: Mesh;
    "3D_LOGO_ARMCHAIR004": Mesh;
    "3D_LOGO_ARMCHAIR005": Mesh;
  };
  materials: {
    [key: string]: Material;
    BLACK: Material;
    WHITE: Material;
  };
};

type FloorHotspotProps = JSX.IntrinsicElements["group"] & {
  scale?: number;
};

export function FloorHotspot_01({ scale = 1, ...props }: FloorHotspotProps) {
  const floorHotspot = IMAGES_3D.Floor_3D_Hotspot_01;
  const { nodes, materials } = useGLTF(floorHotspot) as unknown as GLTFResult;

  return (
    <group {...props} dispose={null} scale={[scale, scale, scale]}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group
          position={[-0.001, 0, 0.005]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.362, 1, 0.362]}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line031.geometry}
            material={materials.BLACK}
            position={[-0.018, 0, -0.025]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line032.geometry}
            material={materials.BLACK}
            position={[-0.006, 0, -0.033]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line033.geometry}
            material={materials.BLACK}
            position={[0.006, 0, -0.04]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line034.geometry}
            material={materials.BLACK}
            position={[0.018, 0, -0.048]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line035.geometry}
            material={materials.BLACK}
            position={[-0.018, 0, 0.037]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line036.geometry}
            material={materials.BLACK}
            position={[-0.006, 0, 0.029]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line037.geometry}
            material={materials.BLACK}
            position={[0.006, 0, 0.022]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line038.geometry}
            material={materials.BLACK}
            position={[0.018, 0, 0.014]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line040.geometry}
            material={materials.BLACK}
            position={[0.066, 0, 0.006]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line041.geometry}
            material={materials.BLACK}
            position={[0.054, 0, -0.002]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line042.geometry}
            material={materials.BLACK}
            position={[0.042, 0, -0.009]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line043.geometry}
            material={materials.BLACK}
            position={[0.03, 0, -0.017]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line044.geometry}
            material={materials.BLACK}
            position={[-0.03, 0, 0.006]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line045.geometry}
            material={materials.BLACK}
            position={[-0.042, 0, -0.002]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line046.geometry}
            material={materials.BLACK}
            position={[-0.054, 0, -0.009]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line047.geometry}
            material={materials.BLACK}
            position={[-0.066, 0, -0.017]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line049.geometry}
            material={materials.BLACK}
            position={[0.048, 0, 0.031]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Line050.geometry}
            material={materials.BLACK}
            position={[-0.048, 0, 0.031]}
          />
        </group>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["3D_LOGO_ARMCHAIR004"].geometry}
          material={materials.WHITE}
          position={[0, -0.236, 0.002]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["3D_LOGO_ARMCHAIR005"].geometry}
          material={materials.BLACK}
          position={[0, 0, 0.003]}
          scale={[1.386, 1.386, 1]}
        />
      </group>
    </group>
  );
}

useGLTF.preload(IMAGES_3D.Floor_3D_Hotspot_01);
