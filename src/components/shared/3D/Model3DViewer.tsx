// "use client";
// import * as THREE from "three";
// import React, { Suspense, useEffect, useMemo } from "react";
// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, Environment, Center, useGLTF } from "@react-three/drei";

// import { GLTF } from "three-stdlib";
// import { PanoramaType } from "@/context/PanoramaContext";
// import { get3DPreviewFor } from "@/lib";

// interface Model3DViewerProps {
//   onLoad?: () => void;
//   panoramaType: PanoramaType;
//   modelIndex: number;
// }

// function GLBPrimitive({ url, onReady }: { url: string; onReady?: () => void }) {
//   const gltf = useGLTF(url) as GLTF;

//   useEffect(() => {
//     onReady?.();
//   }, [onReady]);

//   return (
//     <Center top>
//       {/* key forces a remount when URL changes, avoiding stale cached scene */}
//       <primitive key={url} object={gltf.scene as THREE.Object3D} />
//     </Center>
//   );
// }
// // useGLTF.preload?.("");

// export const Model3DViewer: React.FC<Model3DViewerProps> = ({
//   onLoad,
//   panoramaType,
//   modelIndex
// }) => {
//   const url = useMemo(() => {
//     if (panoramaType !== "bathtub" && panoramaType !== "sink") return null;
//     return get3DPreviewFor(panoramaType, modelIndex);
//   }, [panoramaType, modelIndex]);

//   console.log("url" + url);

//   return (
//     <div style={{ height: 400, width: 400, position: "relative" }}>
//       <Canvas
//         camera={{ position: [0, 1.2, 3.6], fov: 45 }}
//         style={{ height: "100%", width: "100%", background: "transparent" }}
//         dpr={[1, 2]}
//       >
//         <ambientLight intensity={0.6} />
//         <directionalLight position={[4, 6, 6]} intensity={1.1} castShadow />
//         <Environment preset="park" />

//         <OrbitControls
//           enablePan={false}
//           enableZoom={false}
//           minPolarAngle={0}
//           maxPolarAngle={Math.PI}
//           target={[0, 0.4, 0]}
//         />

//         <Suspense fallback={null}>
//           {url ? <GLBPrimitive url={url} onReady={onLoad} /> : null}
//         </Suspense>
//       </Canvas>
//     </div>
//   );
// };
