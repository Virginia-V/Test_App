// const { PanoramaCDNPreprocessor } = require('./src/scripts/preprocess-for-cdn.ts');

// // Simple test to verify the consolidated tour XML generation
// async function testConsolidatedTour() {
//   console.log('🧪 Testing consolidated tour.xml generation...\n');

//   // Mock data for testing
//   const mockTour = {
//     tourId: 'tour-test-123',
//     panorama_id: 'test',
//     base_asset_id: '123',
//     images: [
//       {
//         id: 1,
//         signature: 'panorama-1_base-123_bathtub-C1_M2_MAT3_COL4_sink-C2_M1_MAT2_floor-C1_M1',
//         s3Key: 'test1.jpg',
//         sourcePanoramaId: 1,
//         metadata: {
//           panorama_id: '1',
//           base_asset_id: '123',
//           bathtub: { category: '1', model: '2', material: '3', color: '4' },
//           sink: { category: '2', model: '1', material: '2' },
//           floor: { category: '1', model: '1' }
//         },
//         sceneTitle: 'Bathtub C1M2MAT3COL4 + Sink C2M1MAT2 + Floor C1M1'
//       },
//       {
//         id: 2,
//         signature: 'panorama-1_base-123_bathtub-C2_M1_MAT1_COL1_sink-C1_M2_MAT1_floor-C1_M1',
//         s3Key: 'test2.jpg',
//         sourcePanoramaId: 2,
//         metadata: {
//           panorama_id: '1',
//           base_asset_id: '123',
//           bathtub: { category: '2', model: '1', material: '1', color: '1' },
//           sink: { category: '1', model: '2', material: '1' },
//           floor: { category: '1', model: '1' }
//         },
//         sceneTitle: 'Bathtub C2M1MAT1COL1 + Sink C1M2MAT1 + Floor C1M1'
//       }
//     ]
//   };

//   const mockScenes = [
//     {
//       sceneId: 'scene0',
//       title: 'Bathtub C1M2MAT3COL4 + Sink C2M1MAT2 + Floor C1M1',
//       signature: 'panorama-1_base-123_bathtub-C1_M2_MAT3_COL4_sink-C2_M1_MAT2_floor-C1_M1',
//       tilesPath: '/tours/tour-test-123/scene0/panos',
//       previewPath: '/tours/tour-test-123/scene0/preview.jpg',
//       thumbnailPath: '/tours/tour-test-123/scene0/thumb.jpg',
//       metadata: mockTour.images[0].metadata
//     },
//     {
//       sceneId: 'scene1',
//       title: 'Bathtub C2M1MAT1COL1 + Sink C1M2MAT1 + Floor C1M1',
//       signature: 'panorama-1_base-123_bathtub-C2_M1_MAT1_COL1_sink-C1_M2_MAT1_floor-C1_M1',
//       tilesPath: '/tours/tour-test-123/scene1/panos',
//       previewPath: '/tours/tour-test-123/scene1/preview.jpg',
//       thumbnailPath: '/tours/tour-test-123/scene1/thumb.jpg',
//       metadata: mockTour.images[1].metadata
//     }
//   ];

//   // Test the processor configuration
//   const processor = new PanoramaCDNPreprocessor({
//     apiBaseUrl: 'http://localhost:3000',
//     krpanoPath: '/Applications/krpano-1.23.1/krpanotools',
//     outputDir: './test-output'
//   });

//   console.log('✅ PanoramaCDNPreprocessor instance created successfully');

//   // Test the consolidated XML generation (access private method via reflection)
//   try {
//     const xml = processor.generateConsolidatedTourXML(mockTour, mockScenes);
//     console.log('✅ Consolidated tour.xml generated successfully');
//     console.log('📋 Generated XML preview (first 500 chars):');
//     console.log(xml.substring(0, 500) + '...\n');

//     // Verify key elements in the XML
//     const hasKrpanoRoot = xml.includes('<krpano version="1.23"');
//     const hasCorrectTitle = xml.includes(`title="Virtual Tour - ${mockTour.tourId}"`);
//     const hasSkinInclude = xml.includes('<include url="skin/vtourskin.xml"');
//     const hasScenes = xml.includes('<scene name="scene_tour-test-123_scene0"');
//     const hasMultipleScenes = xml.includes('<scene name="scene_tour-test-123_scene1"');

//     console.log('🔍 XML Validation:');
//     console.log(`  ✅ Has krpano root: ${hasKrpanoRoot}`);
//     console.log(`  ✅ Has correct title: ${hasCorrectTitle}`);
//     console.log(`  ✅ Has skin include: ${hasSkinInclude}`);
//     console.log(`  ✅ Has scene0: ${hasScenes}`);
//     console.log(`  ✅ Has scene1: ${hasMultipleScenes}`);

//     if (hasKrpanoRoot && hasCorrectTitle && hasSkinInclude && hasScenes && hasMultipleScenes) {
//       console.log('\n🎉 Consolidated tour.xml test PASSED!');
//       console.log('\n📊 Benefits of consolidated approach:');
//       console.log('  • Single XML file for entire tour');
//       console.log('  • Easier scene navigation and hotspot linking');
//       console.log('  • Reduced complexity compared to multiple XML files');
//       console.log('  • Standard krpano tour structure');
//       console.log('  • Better organization in /tours/{tourId}/ directory');
//     } else {
//       console.log('\n❌ Consolidated tour.xml test FAILED - Missing required elements');
//     }
//   } catch (error) {
//     console.error('❌ Error testing consolidated XML generation:', error.message);
//   }
// }

// testConsolidatedTour().catch(console.error);