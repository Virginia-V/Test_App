/* hotspotClick.ts */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Helper to wire ONCLICK for a SINGLE krpano hotspot (by name).
 * - Attaches a JS bridge only for that hotspot
 * - Optional variant re-attaches on every new scene
 */

export type HotspotClickCtx = {
  name: string;
  type?: string; // e.g. "image", "text", "threejs"
  style?: string;
  ath?: number;
  atv?: number;
  scene?: string;
  krpano: any;
};

export type SingleHotspotHandler = (ctx: HotspotClickCtx) => void;

function buildCtx(krpano: any, hotspotName: string): HotspotClickCtx {
  const base = `hotspot[${hotspotName}]`;
  return {
    name: hotspotName,
    type: krpano.get(`${base}.type`) ?? krpano.get(`${base}.renderer`),
    style: krpano.get(`${base}.style`),
    ath: Number(krpano.get(`${base}.ath`)),
    atv: Number(krpano.get(`${base}.atv`)),
    scene: krpano.get("scene[get(xml.scene)].name"),
    krpano
  };
}

function hotspotExists(krpano: any, hotspotName: string): boolean {
  // if not present, .name will be null/undefined
  return !!krpano.get(`hotspot[${hotspotName}].name`);
}

/**
 * Attach onclick to a SINGLE hotspot by name in the CURRENT scene.
 * Returns a `detach()` that removes the bridge and attempts to clear onclick.
 */
export function attachHotspotOnclick(
  krpano: any,
  hotspotName: string,
  handler: SingleHotspotHandler
): () => void {
  if (!krpano) {
    console.warn("[hotspotClick] missing krpano instance");
    return () => {};
  }

  // Create a unique bridge per hotspot name
  const bridgeFnName = `__krpanoHotspotClick_${hotspotName.replace(
    /[^a-zA-Z0-9_]/g,
    "_"
  )}`;
  (window as any)[bridgeFnName] = () => {
    try {
      const ctx = buildCtx(krpano, hotspotName);
      handler(ctx);
    } catch (e) {
      console.error("[hotspotClick] handler error:", e);
    }
  };

  if (!hotspotExists(krpano, hotspotName)) {
    console.warn(
      `[hotspotClick] hotspot "${hotspotName}" not found in current scene`
    );
  } else {
    krpano.set(
      `hotspot[${hotspotName}].onclick`,
      `js(window.${bridgeFnName} && window.${bridgeFnName}())`
    );
  }

  // Detach function
  return () => {
    try {
      if (hotspotExists(krpano, hotspotName)) {
        // Clear onclick only if it still points to our bridge
        const current = krpano.get(`hotspot[${hotspotName}].onclick`) as
          | string
          | undefined;
        if (current && current.includes(bridgeFnName)) {
          krpano.set(`hotspot[${hotspotName}].onclick`, null);
        }
      }
    } catch {
      /* noop */
    }
    try {
      delete (window as any)[bridgeFnName];
    } catch {
      /* noop */
    }
  };
}

/**
 * Convenience: attach now AND automatically re-attach the SAME single hotspot
 * on every new scene (useful if the hotspot exists across scenes).
 * Returns a `teardown()` that removes the event hook and bridge.
 */
export function setupHotspotOnclickForScenes(
  krpano: any,
  hotspotName: string,
  handler: SingleHotspotHandler
): () => void {
  let detach = attachHotspotOnclick(krpano, hotspotName, handler);

  const reattachFnName = `__reattach_${hotspotName.replace(
    /[^a-zA-Z0-9_]/g,
    "_"
  )}`;
  (window as any)[reattachFnName] = () => {
    // re-wire for the same hotspot name in the new scene
    try {
      detach(); // clean previous bridge if any
    } catch {
      /* noop */
    }
    detach = attachHotspotOnclick(krpano, hotspotName, handler);
  };

  // Ensure krpano calls our reattach after each scene load
  krpano.set(
    "events.onnewscene",
    `js(window.${reattachFnName} && window.${reattachFnName}())`
  );

  // Teardown removes handler, bridge, and event hook
  return () => {
    try {
      detach();
    } catch {
      /* noop */
    }
    try {
      // Only clear our hook if we were the last to set it
      const current = krpano.get("events.onnewscene") as string | undefined;
      if (current && current.includes(reattachFnName)) {
        krpano.set("events.onnewscene", null);
      }
    } catch {
      /* noop */
    }
    try {
      delete (window as any)[reattachFnName];
    } catch {
      /* noop */
    }
  };
}
