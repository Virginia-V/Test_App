"use client";
import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { Mesh, MeshStandardMaterial, BufferGeometry } from "three";
import { JSX } from "react";

type GLTFResult = GLTF & {
  nodes: {
    m_31341: Mesh & { geometry: BufferGeometry };
  };
  materials: {
    "Material #46": MeshStandardMaterial;
  };
};

type ModelProps = JSX.IntrinsicElements["group"] & {
  modelUrl: string;
};

export function Model({ modelUrl, ...props }: ModelProps) {
  useEffect(() => {
    useGLTF.preload(modelUrl);
  }, [modelUrl]);

  const { nodes, materials } = useGLTF(modelUrl) as unknown as GLTFResult;

  return (
    <group
      {...props}
      dispose={null}
      scale={[5.5, 5.5, 5.5]}
      position={[0, -1.5, 0]}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes?.m_31341?.geometry ?? undefined}
        material={materials["Material #46"]}
      />
    </group>
  );
}
