
// SENTINEL-BPA: FIRST SATELLITE ANALYSIS
// Study Area: Dehradun, Uttarakhand, India

// 1. Define study area

// 1. Load administrative district boundaries
var districts = ee.FeatureCollection(
  'FAO/GAUL/2015/level2'
);

// 2. Select Dehradun district, India
var dehradunDistrict = districts
  .filter(ee.Filter.eq('ADM0_NAME', 'India'))
  .filter(ee.Filter.eq('ADM1_NAME', 'Uttarakhand'))
  .filter(ee.Filter.eq('ADM2_NAME', 'Dehradun'));

// 3. Print boundary information
print('District match count:', dehradunDistrict.size());
print('Dehradun district:', dehradunDistrict);

// 4. Extract district geometry
var dehradun = dehradunDistrict.geometry();

// 5. Centre map on entire district
Map.centerObject(dehradunDistrict, 9);

// 6. Display district boundary


// SENTINEL-BPA: CORRECT DEHRADUN DISTRICT BOUNDARY

var districts = ee.FeatureCollection(
  'FAO/GAUL/2015/level2'
);

// Select Dehra Dun district
var dehradunDistrict = districts
  .filter(ee.Filter.eq('ADM0_NAME', 'India'))
  .filter(ee.Filter.eq('ADM1_NAME', 'Uttarakhand'))
  .filter(ee.Filter.eq('ADM2_NAME', 'Dehra Dun'));

// Extract district geometry
var dehradun = dehradunDistrict.geometry();

// Verify boundary
print('Dehradun district match:', dehradunDistrict.size());
print('Dehradun district boundary:', dehradunDistrict);

// Display boundary
Map.centerObject(dehradunDistrict, 9);

Map.addLayer(
  dehradunDistrict.style({
    color: 'yellow',
    fillColor: '00000000',
    width: 3
  }),
  {},
  'Dehradun District Boundary'
);

// 2. Load Sentinel-2 imagery
var sentinel2 = ee.ImageCollection(
  'COPERNICUS/S2_SR_HARMONIZED'
)
.filterBounds(dehradun)
.filterDate('2024-01-01', '2025-01-01')
.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20));

// 3. Create median composite
var image = sentinel2.median().clip(dehradun);

// 4. Centre map on Dehradun
Map.centerObject(dehradun, 11);

// 5. Display true-colour satellite imagery
Map.addLayer(image, {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000
}, 'Sentinel-2 True Colour');

// 6. Calculate NDVI
var ndvi = image.normalizedDifference(['B8', 'B4']);

Map.addLayer(ndvi, {
  min: -1,
  max: 1,
  palette: ['red', 'yellow', 'green']
}, 'NDVI - Vegetation', false);

// 7. Calculate NDBI
var ndbi = image.normalizedDifference(['B11', 'B8']);

Map.addLayer(ndbi, {
  min: -1,
  max: 1,
  palette: ['blue', 'white', 'red']
}, 'NDBI - Built-up Indicator', false);

// 8. Print results
print('Sentinel-2 image count:', sentinel2.size());
print('Study area:', dehradun);
print('Satellite composite:', image);

// ======================================
// SENTINEL-BPA: BUILT-UP AREA ANALYSIS
// ======================================

// Load Dynamic World dataset
var dw = ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1');

// Function to calculate built-up area
function calculateBuiltUp(year) {

  var start = ee.Date.fromYMD(year, 1, 1);
  var end = start.advance(1, 'year');

  var yearlyImage = dw
  .filterBounds(dehradun)
    .filterDate(start, end)
    .select('built')
    .mean()
    .clip(dehradun);

  // Identify built-up pixels
  var builtUp = yearlyImage.gt(0.5).selfMask();

  // Calculate area in square kilometres
  var area = ee.Image.pixelArea()
    .updateMask(yearlyImage.gt(0.5))
    .reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: dehradun,
      scale: 10,
      maxPixels: 1e13
    });

 
  // Calculate and display built-up area
  var builtUpAreaKm2 = ee.Number(area.get('area')).divide(1e6);

  print('Built-up area (' + year + ') km²:', builtUpAreaKm2);

  Map.addLayer(
    builtUp,
    {palette: ['red']},
    'Built-up ' + year
  );

  return builtUpAreaKm2;
}

// Compare two years
var builtUp2016 = calculateBuiltUp(2016);
var builtUp2025 = calculateBuiltUp(2025);

// Calculate absolute expansion
var builtUpChange = builtUp2025.subtract(builtUp2016);

// Calculate percentage growth
var builtUpGrowth = builtUpChange
  .divide(builtUp2016)
  .multiply(100);

print('Total built-up expansion (km²):', builtUpChange);
print('Built-up growth (%):', builtUpGrowth);


// ==========================================
// SENTINEL-BPA: URBAN EXPANSION DETECTION
// ==========================================

// 1. Identify built-up areas in 2016
var built2016 = dw
  .filterBounds(dehradun)
  .filterDate('2016-01-01', '2017-01-01')
  .select('built')
  .mean()
  .gt(0.5)
  .unmask(0)
  .clip(dehradun);

// 2. Identify built-up areas in 2025
var built2025 = dw
  .filterBounds(dehradun)
  .filterDate('2025-01-01', '2026-01-01')
  .select('built')
  .mean()
  .gt(0.5)
  .unmask(0)
  .clip(dehradun);

// 3. Identify newly developed areas
var newlyBuiltUp = built2025
  .and(built2016.not())
  .selfMask();

// 4. Display urban expansion map
Map.addLayer(
  newlyBuiltUp,
  {palette: ['FF00FF']},
  'New Urban Expansion (2016-2025)',
  true
);

print('Urban expansion detection completed');

 
// ==========================================
// SENTINEL-BPA: POPULATION DISTRIBUTION
// ==========================================

// 1. Load WorldPop Global2 dataset
var populationData = ee.ImageCollection(
  'WorldPop/GP/100m/R2025A/v1/pop'
);

// 2. Function to calculate population
function calculatePopulation(year) {

  var populationImage = populationData
    .filter(ee.Filter.eq('country', 'IND'))
    .filter(ee.Filter.eq('year', year))
    .mosaic()
    .select('population')
    .clip(dehradun);

  // Calculate total population
  var populationStats = populationImage.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: dehradun,
    scale: 100,
    maxPixels: 1e13,
    tileScale: 4
  });

  print(
    'Estimated population (' + year + '):',
    populationStats.get('population')
  );

  return populationImage;
}

// 3. Calculate population for both years
var population2016 = calculatePopulation(2016);
var population2025 = calculatePopulation(2025);

// 4. Display 2025 population distribution
Map.addLayer(
  population2025,
  {
    min: 0,
    max: 100,
    palette: ['white', 'yellow', 'orange', 'red', 'darkred']
  },
  'WorldPop Population 2025'
);

// 5. Display district boundary
Map.addLayer(
  ee.FeatureCollection([ee.Feature(dehradun)]),
  {color: 'cyan'},
  'Dehradun Boundary'
);

print('Population analysis completed');

 
// ==========================================
// SENTINEL-BPA: POPULATION DENSITY ANALYSIS
// ==========================================

// Calculate pixel area in square kilometres
var pixelAreaKm2 = ee.Image.pixelArea().divide(1e6);

// Calculate population density
var populationDensity = population2025.divide(pixelAreaKm2);

// Display population density
Map.addLayer(
  populationDensity.clip(dehradun),
  {
    min: 0,
    max: 5000,
    palette: [
      'white',
      'yellow',
      'orange',
      'red',
      'darkred'
    ]
  },
  'Population Density 2025'
);

// Calculate total district area
var districtArea = ee.Image.pixelArea().reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: dehradun,
  scale: 100,
  maxPixels: 1e13,
  tileScale: 4
});

// Calculate average population density
var totalAreaKm2 = ee.Number(
  districtArea.get('area')
).divide(1e6);

var totalPopulation2025 = population2025.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: dehradun,
  scale: 100,
  maxPixels: 1e13,
  tileScale: 4
});

var averageDensity = ee.Number(
  totalPopulation2025.get('population')
).divide(totalAreaKm2);

print('District area (km2):', totalAreaKm2);
print('Average population density (people/km2):',
  averageDensity);

 
// ==========================================
// SENTINEL-BPA: POPULATION HOTSPOTS
// ==========================================

// Exclude zero-population pixels
var validDensity = populationDensity
  .updateMask(population2025.gt(0));

// Calculate population density percentiles
var densityPercentiles = validDensity.reduceRegion({
  reducer: ee.Reducer.percentile([25, 50, 75, 90]),
  geometry: dehradun,
  scale: 100,
  maxPixels: 1e13,
  tileScale: 4
});

print('Population density percentiles:',
  densityPercentiles);

// Extract 75th percentile
var highDensityThreshold =
  ee.Number(densityPercentiles.get('population_p75'));

// Identify high-density areas
var hotspots = validDensity
  .gte(highDensityThreshold)
  .selfMask();

// Display hotspots
Map.addLayer(
  hotspots,
  {palette: ['red']},
  'High Population Density Hotspots'
);

print('High-density threshold (people/km2):',
  highDensityThreshold);

// ==================================================
// SENTINEL-BPA: COMBINED URBAN AND POPULATION ANALYSIS
// ==================================================

// 1. Calculate population density per square kilometre
var populationDensity2025 = population2025
  .divide(ee.Image.pixelArea().divide(1e6))
  .rename('people_per_km2');

// 2. Identify high-density areas using P75 threshold
var highDensityMask = populationDensity2025
  .gt(1951.7426650954442);

// 3. Identify overlap between new urban areas
// and high population density areas
var urbanPopulationOverlap = newlyBuiltUp
  .and(highDensityMask)
  .selfMask();

// 4. Calculate overlap area in square kilometres
var overlapArea = ee.Image.pixelArea()
  .updateMask(urbanPopulationOverlap)
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: dehradun,
    scale: 100,
    maxPixels: 1e13,
    tileScale: 4
  });

var overlapAreaKm2 = ee.Number(
  overlapArea.get('area')
).divide(1e6);

// 5. Calculate total newly developed urban area
var newUrbanArea = ee.Image.pixelArea()
  .updateMask(newlyBuiltUp)
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: dehradun,
    scale: 100,
    maxPixels: 1e13,
    tileScale: 4
  });

var newUrbanAreaKm2 = ee.Number(
  newUrbanArea.get('area')
).divide(1e6);

// 6. Calculate overlap percentage
var overlapPercentage = overlapAreaKm2
  .divide(newUrbanAreaKm2)
  .multiply(100);

// 7. Display combined hotspot map
Map.addLayer(
  urbanPopulationOverlap,
  {palette: ['magenta']},
  'Urban Expansion + High Density Overlap',
  true
);

// 8. Print final results
print('Combined analysis completed');

print(
  'New urban area (km2):',
  newUrbanAreaKm2
);

print(
  'Urban area overlapping high-density zones (km2):',
  overlapAreaKm2
);

print(
  'Percentage of new urban area overlapping high-density zones (%):',
  overlapPercentage
);
