import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Ruler, Move, ArrowUpDown, Mountain, ShieldCheck, Sun, Eye, CheckCircle, AlertTriangle, XCircle, Brain, Calculator, Loader2, Lightbulb, AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ResultCard from "@/components/ResultCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalysisResult, SuitabilityResult } from "@/services/api";
import { fetchAISuitability } from "@/services/api";

function formatNumber(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SuitabilityDisplay({ suitability, showExtras }: { suitability: SuitabilityResult; showExtras?: boolean }) {
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-card rounded-2xl shadow-surface flex flex-col sm:flex-row items-center gap-6"
      >
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={
                suitability.overallScore >= 70 ? "hsl(142, 71%, 45%)" :
                suitability.overallScore >= 50 ? "hsl(45, 93%, 47%)" : "hsl(0, 72%, 51%)"
              }
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${suitability.overallScore * 2.64} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{suitability.overallScore}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">/ 100</span>
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
            <span className={`text-xl font-bold ${
              suitability.grade === "A" || suitability.grade === "B" ? "text-green-500" :
              suitability.grade === "C" ? "text-yellow-500" : "text-red-500"
            }`}>
              Grade {suitability.grade}
            </span>
            {suitability.method === "ai-ml" && (
              <span className="px-2 py-0.5 bg-accent/20 text-accent-foreground text-[10px] font-bold uppercase tracking-wider rounded">
                AI-Powered
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{suitability.recommendation}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {suitability.factors.map((f, i) => {
          const icon = f.status === "good" ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                       f.status === "moderate" ? <AlertTriangle className="w-4 h-4 text-yellow-500" /> :
                       <XCircle className="w-4 h-4 text-red-500" />;
          return (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-4 bg-card rounded-xl shadow-surface flex items-start gap-3"
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{f.label}</p>
                  {f.score !== undefined && (
                    <span className="text-xs font-bold text-muted-foreground">{f.score}/100</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{f.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {showExtras && suitability.risks && suitability.risks.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="p-5 bg-card rounded-xl shadow-surface">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-semibold text-foreground">Risk Factors</h3>
          </div>
          <ul className="space-y-1.5">
            {suitability.risks.map((r, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span> {r}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {showExtras && suitability.suggestedUses && suitability.suggestedUses.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="p-5 bg-card rounded-xl shadow-surface">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-semibold text-foreground">Suggested Construction Types</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {suitability.suggestedUses.map((u, i) => (
              <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full font-medium">{u}</span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

const Results = () => {
  const location = useLocation();
  const result = location.state?.result as AnalysisResult | undefined;
  const coordinates = location.state?.coordinates;
  const [aiSuitability, setAiSuitability] = useState<SuitabilityResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (result && coordinates && !aiSuitability) {
      setAiLoading(true);
      setAiError(null);
      fetchAISuitability(
        result.area,
        result.length,
        result.width,
        result.heightEstimate,
        result.shadowHeightEstimate,
        coordinates
      ).then((data) => {
        if (data) {
          setAiSuitability(data);
        } else {
          setAiError("AI analysis failed. The rule-based evaluation is still available.");
        }
      }).finally(() => setAiLoading(false));
    }
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No analysis data available.</p>
            <Link
              to="/map"
              className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-surface"
            >
              Go to Map Analysis
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Analysis Results</h1>
          <p className="text-sm text-muted-foreground">
            Geospatial metrics for the selected region.
          </p>
        </div>

        {/* Basic Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <ResultCard label="Area" value={formatNumber(result.area)} unit="m²" icon={<Ruler className="w-4 h-4" />} />
          <ResultCard label="Length" value={formatNumber(result.length)} unit="m" icon={<ArrowUpDown className="w-4 h-4" />} />
          <ResultCard label="Width" value={formatNumber(result.width)} unit="m" icon={<Move className="w-4 h-4" />} />
        </div>

        {/* Height Estimation */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Height Estimation</h2>
          <Tabs defaultValue="elevation" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="elevation" className="gap-2">
                <Mountain className="w-4 h-4" />
                Terrain Elevation API
              </TabsTrigger>
              <TabsTrigger value="shadow" className="gap-2">
                <Sun className="w-4 h-4" />
                Shadow Cast Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="elevation">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <ResultCard label="Min Elevation" value={result.heightEstimate ? formatNumber(result.heightEstimate.minElevation) : "N/A"} unit="m" icon={<Mountain className="w-4 h-4" />} isFuture={!result.heightEstimate} />
                <ResultCard label="Max Elevation" value={result.heightEstimate ? formatNumber(result.heightEstimate.maxElevation) : "N/A"} unit="m" icon={<Mountain className="w-4 h-4" />} isFuture={!result.heightEstimate} />
                <ResultCard label="Avg Elevation" value={result.heightEstimate ? formatNumber(result.heightEstimate.avgElevation) : "N/A"} unit="m" icon={<Mountain className="w-4 h-4" />} isFuture={!result.heightEstimate} />
                <ResultCard label="Elevation Range" value={result.heightEstimate ? formatNumber(result.heightEstimate.elevationRange) : "N/A"} unit="m" icon={<ArrowUpDown className="w-4 h-4" />} isFuture={!result.heightEstimate} />
              </div>
              <p className="text-xs text-muted-foreground mt-3">Data sourced from Open-Meteo Elevation API using sampled polygon vertices.</p>
            </TabsContent>

            <TabsContent value="shadow">
              {result.shadowHeightEstimate ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <ResultCard label="Estimated Height" value={formatNumber(result.shadowHeightEstimate.estimatedHeight)} unit="m" icon={<ArrowUpDown className="w-4 h-4" />} />
                    <ResultCard label="Shadow Length" value={formatNumber(result.shadowHeightEstimate.shadowLength)} unit="m" icon={<Eye className="w-4 h-4" />} />
                    <ResultCard label="Sun Elevation Angle" value={formatNumber(result.shadowHeightEstimate.sunElevationAngle)} unit="°" icon={<Sun className="w-4 h-4" />} />
                    <ResultCard label="Confidence" value={result.shadowHeightEstimate.confidence} unit="" icon={<ShieldCheck className="w-4 h-4" />} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">{result.shadowHeightEstimate.method} — Uses sun position & shadow geometry to estimate structure height.</p>
                </>
              ) : (
                <div className="p-6 rounded-xl bg-card shadow-surface text-center">
                  <p className="text-sm text-muted-foreground mb-3">Shadow analysis data unavailable. Please re-run the analysis.</p>
                  <Link to="/map" className="inline-flex px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-surface hover:brightness-110 transition-all duration-200">Re-run Analysis</Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Construction Suitability - Two Methods */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Construction Suitability</h2>
          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="ai" className="gap-2">
                <Brain className="w-4 h-4" />
                AI / ML Analysis
              </TabsTrigger>
              <TabsTrigger value="rule" className="gap-2">
                <Calculator className="w-4 h-4" />
                Rule-Based
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai">
              {aiLoading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 bg-card rounded-2xl shadow-surface text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">AI Model Analyzing Region…</p>
                  <p className="text-xs text-muted-foreground mt-1">Evaluating terrain, slope, accessibility, and construction potential</p>
                </motion.div>
              ) : aiSuitability ? (
                <SuitabilityDisplay suitability={aiSuitability} showExtras />
              ) : (
                <div className="p-6 rounded-xl bg-card shadow-surface text-center">
                  <p className="text-sm text-muted-foreground mb-2">{aiError || "AI analysis not available."}</p>
                  <p className="text-xs text-muted-foreground">Switch to the Rule-Based tab for the standard evaluation.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rule">
              {result.suitability ? (
                <SuitabilityDisplay suitability={result.suitability} />
              ) : (
                <ResultCard label="Construction Suitability" value="" isFuture icon={<ShieldCheck className="w-4 h-4" />} />
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-8">
          <Link to="/map" className="inline-flex px-6 py-3 rounded-xl bg-card shadow-surface text-foreground font-medium text-sm hover:bg-secondary transition-all duration-200">
            ← New Analysis
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
