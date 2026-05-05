// SmartGeo Geospatial Analysis Service
// In production, this would call a FastAPI backend.
// For the prototype, calculations are done client-side.

export interface PolygonCoordinates {
  lat: number;
  lng: number;
}

export interface ElevationData {
  minElevation: number;
  maxElevation: number;
  avgElevation: number;
  elevationRange: number;
}

export interface ShadowHeightData {
  estimatedHeight: number;
  shadowLength: number;
  sunElevationAngle: number;
  confidence: string;
  method: string;
}

export interface SuitabilityResult {
  overallScore: number;
  grade: string;
  slopeScore: number;
  areaScore: number;
  elevationScore: number;
  flatnessScore: number;
  factors: { label: string; value: string; status: "good" | "moderate" | "poor"; score?: number }[];
  recommendation: string;
  risks?: string[];
  suggestedUses?: string[];
  method: "rule-based" | "ai-ml";
}

export interface AnalysisResult {
  area: number;
  length: number;
  width: number;
  heightEstimate: ElevationData | null;
  shadowHeightEstimate: ShadowHeightData | null;
  suitability: SuitabilityResult | null;
  aiSuitability: SuitabilityResult | null;
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Approximate area using the Shoelface formula on Web Mercator projection
function calculateArea(coords: PolygonCoordinates[]): number {
  if (coords.length < 3) return 0;

  const latMid = coords.reduce((s, c) => s + c.lat, 0) / coords.length;
  const mPerDegLat = 111132.92 - 559.82 * Math.cos(2 * toRadians(latMid));
  const mPerDegLng = 111412.84 * Math.cos(toRadians(latMid));

  const meterCoords = coords.map((c) => ({
    x: c.lat * mPerDegLat,
    y: c.lng * mPerDegLng,
  }));

  // Shoelace formula
  let area = 0;
  for (let i = 0; i < meterCoords.length; i++) {
    const j = (i + 1) % meterCoords.length;
    area += meterCoords[i].x * meterCoords[j].y;
    area -= meterCoords[j].x * meterCoords[i].y;
  }
  area = Math.abs(area) / 2;

  return area;
}

function calculateBounds(coords: PolygonCoordinates[]) {
  const latMid = coords.reduce((s, c) => s + c.lat, 0) / coords.length;
  const mPerDegLat = 111132.92 - 559.82 * Math.cos(2 * toRadians(latMid));
  const mPerDegLng = 111412.84 * Math.cos(toRadians(latMid));

  const lats = coords.map((c) => c.lat * mPerDegLat);
  const lngs = coords.map((c) => c.lng * mPerDegLng);

  const length = Math.max(...lats) - Math.min(...lats);
  const width = Math.max(...lngs) - Math.min(...lngs);

  return { length, width };
}

async function fetchElevation(
  coordinates: PolygonCoordinates[]
): Promise<ElevationData | null> {
  try {
    const samplePoints = coordinates.slice(0, 20);
    const latitudes = samplePoints.map((c) => c.lat.toFixed(6)).join(",");
    const longitudes = samplePoints.map((c) => c.lng.toFixed(6)).join(",");

    const res = await fetch(
      `https://api.open-meteo.com/v1/elevation?latitude=${latitudes}&longitude=${longitudes}`
    );

    if (!res.ok) throw new Error("Elevation API error");

    const data = await res.json();
    const elevations: number[] = data.elevation;

    if (!elevations || elevations.length === 0) throw new Error("No elevation data");

    const minElevation = Math.min(...elevations);
    const maxElevation = Math.max(...elevations);
    const avgElevation = elevations.reduce((s, e) => s + e, 0) / elevations.length;

    return {
      minElevation: Math.round(minElevation * 100) / 100,
      maxElevation: Math.round(maxElevation * 100) / 100,
      avgElevation: Math.round(avgElevation * 100) / 100,
      elevationRange: Math.round((maxElevation - minElevation) * 100) / 100,
    };
  } catch (err) {
    console.error("Elevation fetch failed:", err);
    return null;
  }
}

// Shadow-based height estimation (simulated)
// In production, this would use satellite imagery + sun position to measure shadow length
function estimateShadowHeight(
  coordinates: PolygonCoordinates[],
  area: number
): ShadowHeightData {
  const latMid = coordinates.reduce((s, c) => s + c.lat, 0) / coordinates.length;
  
  // Simulate sun elevation angle based on latitude (simplified solar geometry)
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const declination = 23.45 * Math.sin(toRadians((360 / 365) * (dayOfYear - 81)));
  const hourAngle = (now.getUTCHours() - 12) * 15;
  const sunElevation = Math.asin(
    Math.sin(toRadians(latMid)) * Math.sin(toRadians(declination)) +
    Math.cos(toRadians(latMid)) * Math.cos(toRadians(declination)) * Math.cos(toRadians(hourAngle))
  );
  const sunElevationDeg = Math.max(15, (sunElevation * 180) / Math.PI);

  // Estimate shadow length from polygon dimensions
  const side = Math.sqrt(area);
  const shadowLength = side * 0.3 + Math.random() * side * 0.1;
  const estimatedHeight = shadowLength * Math.tan(toRadians(sunElevationDeg));

  let confidence = "High";
  if (sunElevationDeg < 25) confidence = "Low";
  else if (sunElevationDeg < 40) confidence = "Medium";

  return {
    estimatedHeight: Math.round(estimatedHeight * 100) / 100,
    shadowLength: Math.round(shadowLength * 100) / 100,
    sunElevationAngle: Math.round(sunElevationDeg * 100) / 100,
    confidence,
    method: "Shadow Analysis (Simulated)",
  };
}

function evaluateSuitability(
  area: number,
  length: number,
  width: number,
  elevation: ElevationData | null
): SuitabilityResult {
  const factors: SuitabilityResult["factors"] = [];

  // 1. Area score — larger usable area is better for construction
  let areaScore: number;
  if (area >= 5000) { areaScore = 95; factors.push({ label: "Area Size", value: `${(area / 1000).toFixed(1)}k m² — Excellent`, status: "good" }); }
  else if (area >= 500) { areaScore = 70; factors.push({ label: "Area Size", value: `${area.toFixed(0)} m² — Adequate`, status: "moderate" }); }
  else { areaScore = 35; factors.push({ label: "Area Size", value: `${area.toFixed(0)} m² — Very small`, status: "poor" }); }

  // 2. Aspect ratio (length / width) — closer to 1 is better
  const aspect = length > 0 && width > 0 ? Math.max(length, width) / Math.min(length, width) : 1;
  let flatnessScore: number;
  if (aspect <= 2) { flatnessScore = 90; factors.push({ label: "Shape Regularity", value: `Ratio ${aspect.toFixed(1)} — Regular`, status: "good" }); }
  else if (aspect <= 4) { flatnessScore = 60; factors.push({ label: "Shape Regularity", value: `Ratio ${aspect.toFixed(1)} — Elongated`, status: "moderate" }); }
  else { flatnessScore = 30; factors.push({ label: "Shape Regularity", value: `Ratio ${aspect.toFixed(1)} — Narrow strip`, status: "poor" }); }

  // 3. Slope / elevation range
  let slopeScore: number;
  if (elevation) {
    const range = elevation.elevationRange;
    if (range <= 5) { slopeScore = 95; factors.push({ label: "Terrain Slope", value: `${range.toFixed(1)} m range — Flat`, status: "good" }); }
    else if (range <= 20) { slopeScore = 60; factors.push({ label: "Terrain Slope", value: `${range.toFixed(1)} m range — Moderate`, status: "moderate" }); }
    else { slopeScore = 25; factors.push({ label: "Terrain Slope", value: `${range.toFixed(1)} m range — Steep`, status: "poor" }); }
  } else {
    slopeScore = 50;
    factors.push({ label: "Terrain Slope", value: "No data", status: "moderate" });
  }

  // 4. Elevation suitability — extreme elevations are harder to build on
  let elevationScore: number;
  if (elevation) {
    const avg = elevation.avgElevation;
    if (avg >= 0 && avg <= 1500) { elevationScore = 90; factors.push({ label: "Elevation", value: `${avg.toFixed(0)} m avg — Suitable`, status: "good" }); }
    else if (avg <= 3000) { elevationScore = 55; factors.push({ label: "Elevation", value: `${avg.toFixed(0)} m avg — Challenging`, status: "moderate" }); }
    else { elevationScore = 20; factors.push({ label: "Elevation", value: `${avg.toFixed(0)} m avg — Extreme`, status: "poor" }); }
  } else {
    elevationScore = 50;
    factors.push({ label: "Elevation", value: "No data", status: "moderate" });
  }

  // Weighted overall
  const overallScore = Math.round(areaScore * 0.25 + flatnessScore * 0.2 + slopeScore * 0.35 + elevationScore * 0.2);

  let grade: string;
  if (overallScore >= 85) grade = "A";
  else if (overallScore >= 70) grade = "B";
  else if (overallScore >= 55) grade = "C";
  else if (overallScore >= 40) grade = "D";
  else grade = "F";

  const recommendations: Record<string, string> = {
    A: "Excellent site — highly suitable for most construction projects with minimal ground preparation.",
    B: "Good site — suitable for construction with standard preparation and grading.",
    C: "Fair site — construction feasible but requires significant site work and engineering assessment.",
    D: "Poor site — major challenges; extensive earthwork, slope stabilization, or design modifications needed.",
    F: "Unsuitable — extreme conditions make construction impractical without extraordinary measures.",
  };

  return {
    overallScore,
    grade,
    slopeScore,
    areaScore,
    elevationScore,
    flatnessScore,
    factors,
    recommendation: recommendations[grade],
    method: "rule-based" as const,
  };
}

export async function fetchAISuitability(
  area: number,
  length: number,
  width: number,
  elevation: ElevationData | null,
  shadow: ShadowHeightData | null,
  coordinates: PolygonCoordinates[]
): Promise<SuitabilityResult | null> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.functions.invoke("ai-suitability", {
      body: { area, length, width, elevation, shadow, coordinates },
    });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return {
      overallScore: data.overallScore,
      grade: data.grade,
      slopeScore: 0,
      areaScore: 0,
      elevationScore: 0,
      flatnessScore: 0,
      factors: data.factors,
      recommendation: data.recommendation,
      risks: data.risks,
      suggestedUses: data.suggestedUses,
      method: "ai-ml",
    };
  } catch (err) {
    console.error("AI suitability failed:", err);
    return null;
  }
}

export async function analyzeRegion(
  coordinates: PolygonCoordinates[]
): Promise<AnalysisResult> {
  const area = calculateArea(coordinates);
  const { length, width } = calculateBounds(coordinates);

  const heightEstimate = await fetchElevation(coordinates);
  const shadowHeightEstimate = estimateShadowHeight(coordinates, area);
  const suitability = evaluateSuitability(area, length, width, heightEstimate);

  return {
    area: Math.round(area * 100) / 100,
    length: Math.round(length * 100) / 100,
    width: Math.round(width * 100) / 100,
    heightEstimate,
    shadowHeightEstimate,
    suitability,
    aiSuitability: null, // fetched separately after initial results load
  };
}
