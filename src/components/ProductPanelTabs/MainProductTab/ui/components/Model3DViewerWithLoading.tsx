// "use client";

// import React, { useState, useMemo } from "react";
// import { useGLTF } from "@react-three/drei";
// import { Model3DViewer } from "@/components/shared";
// import { LoadingIndicator } from "./LoadingIndicator";
// import { CategoryType } from "@/helpers";
// import { get3DPreviewFor } from "@/lib";

// interface Model3DViewerWithLoadingProps {
//   categoryType: CategoryType;
//   modelIndex: number;
//   onLoad?: () => void;
// }

// // GLB preload utility function
// export function preloadGLB(url?: string | null) {
//   if (url) useGLTF.preload(url);
// }

// export const Model3DViewerWithLoading: React.FC<
//   Model3DViewerWithLoadingProps
// > = ({ categoryType, modelIndex, onLoad }) => {
//   const [loading, setLoading] = useState(false);

//   const canShow3D = categoryType === "bathtub" || categoryType === "sink";
//   const modelUrl = useMemo(
//     () => (canShow3D ? get3DPreviewFor(categoryType, modelIndex) : null),
//     [canShow3D, categoryType, modelIndex]
//   );

//   const handle3DLoaded = () => {
//     setLoading(false);
//     onLoad?.();
//   };

//   if (!canShow3D || !modelUrl) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <span>No 3D model available</span>
//       </div>
//     );
//   }

//   return (
//     <>
//       {loading && <LoadingIndicator />}
//       <Model3DViewer
//         onLoad={handle3DLoaded}
//         panoramaType={categoryType}
//         modelIndex={modelIndex}
//       />
//     </>
//   );
// };
