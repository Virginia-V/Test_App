// "use client";

// import KrpanoViewer from "@/components/KpranoViewer";

// export default function HomePage() {
//   // const tourId = "tour-1-1";
//   const xmlUrl = "/api/krpano/tours/tour-1-1/tour.xml";
//   const viewerScriptUrl = "/api/krpano/tours/tour-1-1/krpano.js"; // <- from Hetzner via API

//   return (
//     <main className="h-[100dvh] w-full">
//       <KrpanoViewer xmlUrl={xmlUrl} viewerScriptUrl={viewerScriptUrl} />
//     </main>
//   );
// }

"use client";

import KrpanoViewer from "@/components/KpranoViewer";

export default function HomePage() {
  const base = "/tours/tour-1-1"; // served from /public/tours/tour-1-1
  return (
    <main className="h-[100dvh] w-full">
      <KrpanoViewer
        xmlUrl={`${base}/tour.xml`}
        viewerScriptUrl={`${base}/krpano.js`} // <-- your public krpano.js
      />
    </main>
  );
}


