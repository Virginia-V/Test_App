"use client";
// import dynamic from "next/dynamic";

import CubePano from "@/components/CubePano";
import KrpanoWithMenu from "@/components/KrpanoWithMenu";

// const PanoramaViewer = dynamic(() => import("../components/PanoramaViewer"), {
//   ssr: false
// });

// export default function Home() {
//   return (
//     // full-bleed, fixed to the viewport
//     <div style={{ position: "fixed", inset: 0 }}>
//       <PanoramaViewer
//         tilesBasePath="/tiles_wood"
//         tileExt="png"
//         height="100dvh"
//       />
//     </div>
//   );
// }

// app/page.tsx (or any client page)
// "use client";
// import AFramePano from "@/components/AFramePano";

// export default function Page() {
//   return (
//     <main style={{ padding: 24 }}>
//       <h1>16K A-Frame Panorama</h1>
//       <AFramePano  />
//     </main>
//   );
// }

// "use client";

// import MarzipanoSingle from "@/components/MarzipanoSingle";

// export default function Page() {
//   return (
//     <main style={{ padding: 24 }}>
//       <h1>Marzipano 16K Panorama</h1>

//       {/* Render your single-image viewer */}
//       <MarzipanoSingle
//         approximateWidth={16384} // match your actual image width
//         height={600} // adjust viewer height
//       />
//     </main>
//   );
// }

// export default function Page() {
//   return <CubePano />;
// }

import dynamic from "next/dynamic";

const KrpanoViewer = dynamic(() => import("@/components/KrpanoViewer"), {
  ssr: false
});

export default function Page() {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden"
      }}
    >
      <KrpanoWithMenu />
    </main>
  );
}
