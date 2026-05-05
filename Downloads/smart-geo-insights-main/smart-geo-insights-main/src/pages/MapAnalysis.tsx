import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import MapComponent, { type PolygonCoords } from "@/components/MapComponent";
import LoadingOverlay from "@/components/LoadingOverlay";
import { analyzeRegion } from "@/services/api";

const MapAnalysis = () => {
  const [coordinates, setCoordinates] = useState<PolygonCoords[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (coordinates.length < 3) return;
    setLoading(true);
    try {
      const result = await analyzeRegion(coordinates);
      navigate("/results", { state: { result, coordinates } });
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <AnimatePresence>{loading && <LoadingOverlay />}</AnimatePresence>

      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Map Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Search a location, then use the polygon tool to select a region for analysis.
          </p>
        </div>

        <MapComponent
          onPolygonComplete={setCoordinates}
          onClear={() => setCoordinates([])}
        />

        {coordinates.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 p-4 rounded-xl bg-card shadow-surface">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Selected Region — {coordinates.length} points
              </p>
              <p className="text-xs text-muted-foreground tabular-nums font-mono truncate">
                {coordinates.map((c) => `[${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}]`).join(", ")}
              </p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-surface hover:brightness-110 transition-all duration-200 disabled:opacity-50"
            >
              Analyze Region
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MapAnalysis;
