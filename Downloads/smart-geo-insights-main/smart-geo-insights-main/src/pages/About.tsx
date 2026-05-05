import { motion } from "framer-motion";
import { CheckCircle, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const implemented = [
  "Satellite map display with Esri imagery",
  "Location search via geocoding",
  "Polygon drawing tool",
  "Area calculation (Shoelace formula)",
  "Length and width estimation",
  "Basic results dashboard",
];

const future = [
  "Height estimation using shadow analysis",
  "DEM elevation analysis",
  "AI building detection",
  "Construction suitability prediction",
  "Export reports as PDF",
];

const About = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <main className="flex-1 container mx-auto px-6 py-16 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-foreground mb-4">About SmartGeo</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          SmartGeo is an academic innovation project that explores how satellite imagery and artificial intelligence can be used to analyze infrastructure remotely. It aims to support urban planning, civil engineering studies, and infrastructure feasibility analysis.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 bg-card rounded-2xl shadow-surface">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              Implemented
            </h2>
            <ul className="space-y-2">
              {implemented.map((item) => (
                <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 bg-card rounded-2xl shadow-surface">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Future Implementation
            </h2>
            <ul className="space-y-2">
              {future.map((item) => (
                <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 p-6 bg-card rounded-2xl shadow-surface">
          <h2 className="font-semibold text-foreground mb-2">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {["React", "TypeScript", "Tailwind CSS", "Leaflet", "Framer Motion", "FastAPI (planned)", "Shapely (planned)"].map((t) => (
              <span key={t} className="px-3 py-1 rounded-lg bg-secondary text-xs font-medium text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </main>
    <Footer />
  </div>
);

export default About;
