import fs from "fs";

const TOUR_XML_PATH = "public/tours/tour-1-1/tour.xml";

async function updateTourXMLScenes() {
  console.log("🔧 Starting tour.xml scene naming conversion...");
  
  // Read the tour.xml file
  let xmlContent = fs.readFileSync(TOUR_XML_PATH, "utf-8");
  
  // Track conversion progress
  let conversionCount = 0;
  
  // Use a simpler approach - replace all scene blocks that start with complex names
  const sceneBlockPattern = /<scene name="scene_[^"]*"[^>]*title="([^"]*)"[^>]*>[\s\S]*?<\/scene>/g;
  
  xmlContent = xmlContent.replace(sceneBlockPattern, (match, title) => {
    // Skip if it's already in the correct format (scene0, scene1, etc.)
    if (match.includes('name="scene0"') || match.includes('name="scene1"') || match.includes('name="scene2"')) {
      return match;
    }
    
    // For all other scenes, convert them to the simplified format
    conversionCount++;
    const sceneNumber = conversionCount + 2; // +2 because we already have scene0, scene1, scene2
    const newSceneName = `scene${sceneNumber}`;
    
    return `  <scene name="${newSceneName}" title="${title}" onstart="" thumburl="${newSceneName}/thumb.jpg" lat="" lng="" alt="" heading="">
    <control bouncinglimits="calc:image.cube ? true : false" />
    <view hlookat="0.0" vlookat="0.0" fovtype="MFOV" fov="120" maxpixelzoom="2.0" fovmin="70" fovmax="140" limitview="auto" />
    <preview url="${newSceneName}/preview.jpg" />
    <image>
      <cube url="${newSceneName}/panos/tour_1_1_${newSceneName}.tiles/%s/l%l/%0v/l%l_%s_%0v_%0h.jpg" multires="512,640,1280,2624,5248" />
    </image>
  </scene>`;
  });
  
  // Write the updated content back to the file
  fs.writeFileSync(TOUR_XML_PATH, xmlContent, "utf-8");
  
  console.log(`✅ Successfully converted ${conversionCount} scenes`);
  console.log(`📄 Updated ${TOUR_XML_PATH}`);
}

// Run the script
updateTourXMLScenes().catch(console.error);