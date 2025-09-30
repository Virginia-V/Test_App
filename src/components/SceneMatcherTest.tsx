"use client";
import React, { useEffect, useState } from "react";
import { findMatchingSceneByTitle, Selection } from "@/lib/sceneMatcher";

export default function SceneMatcherTest() {
  const [sceneId, setSceneId] = useState<string | null>(null);

  useEffect(() => {
    // Example selection
    const selection: Selection = {
      bathtub: {
        category_id: 1,
        model_id: 1,
        material_id: null,
        color_id: null
      },
      sink: { category_id: 2, model_id: 4, material_id: null },
      floor: { category_id: 3, model_id: 7 }
    };

    fetch("/all-scenes.json")
      .then((res) => res.json())
      .then((scenes) => {
        const matched = findMatchingSceneByTitle(scenes, selection);
        setSceneId(matched?.sceneId ?? "No match found");
      });
  }, []);

  return (
    <div>
      <h2>Scene Matcher Test</h2>
      <div>
        <strong>Matched sceneId:</strong> {sceneId}
      </div>
    </div>
  );
}
