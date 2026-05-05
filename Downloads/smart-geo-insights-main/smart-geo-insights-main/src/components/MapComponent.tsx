import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

export interface PolygonCoords {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  onPolygonComplete: (coords: PolygonCoords[]) => void;
  onClear: () => void;
}

const MapComponent = ({ onPolygonComplete, onClear }: MapComponentProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [25.276987, 55.296249], // Dubai
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles © Esri",
        maxZoom: 19,
      }
    ).addTo(map);

    // Labels overlay
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19 }
    ).addTo(map);

    map.addLayer(drawnItemsRef.current);

    const drawControl = new (L.Control as any).Draw({
      draw: {
        polygon: {
          shapeOptions: {
            color: "#10B981",
            fillColor: "#10B981",
            fillOpacity: 0.3,
            weight: 2,
          },
          allowIntersection: false,
        },
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItemsRef.current,
      },
    });
    map.addControl(drawControl);

    map.on((L as any).Draw.Event.CREATED, (e: any) => {
      drawnItemsRef.current.clearLayers();
      const layer = e.layer;
      drawnItemsRef.current.addLayer(layer);
      const latlngs = layer.getLatLngs()[0] as L.LatLng[];
      onPolygonComplete(latlngs.map((ll) => ({ lat: ll.lat, lng: ll.lng })));
    });

    mapRef.current = map;

    // Fix tile rendering after container is fully laid out
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapRef.current) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        mapRef.current.setView([parseFloat(lat), parseFloat(lon)], 17);
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleClear = () => {
    drawnItemsRef.current.clearLayers();
    onClear();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search location..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-card shadow-surface text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          onClick={handleSearch}
          className="px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium shadow-surface hover:brightness-110 transition-all duration-200"
        >
          Search
        </button>
        <button
          onClick={handleClear}
          className="px-5 py-2.5 rounded-xl bg-card text-foreground text-sm font-medium shadow-surface hover:bg-secondary transition-all duration-200"
        >
          Clear
        </button>
      </div>
      <div
        ref={containerRef}
        className="w-full h-[600px] rounded-2xl overflow-hidden shadow-surface"
      />
    </div>
  );
};

export default MapComponent;
