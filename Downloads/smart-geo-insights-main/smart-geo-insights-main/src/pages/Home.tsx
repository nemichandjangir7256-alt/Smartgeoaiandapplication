import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Ruler, Mountain, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    icon: <MapPin className="w-5 h-5" />,
    title: "Satellite Map Analysis",
    desc: "High-resolution satellite imagery for precise geospatial analysis of any location worldwide.",
  },
  {
    icon: <Ruler className="w-5 h-5" />,
    title: "Infrastructure Measurement",
    desc: "Calculate area, length, and width of selected regions with surveyor-grade accuracy.",
  },
  {
    icon: <Mountain className="w-5 h-5" />,
    title: "Height Estimation",
    desc: "Estimate building heights using elevation data and shadow analysis techniques.",
    future: false,
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Suitability Evaluation",
    desc: "AI-powered construction suitability scoring based on terrain and infrastructure data.",
    future: false,
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0, 0, 1] as [number, number, number, number] } },
};

const Home = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />

    {/* Hero */}
    <section className="flex-1 flex items-center justify-center py-24 px-6">
      <div className="max-w-3xl text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-4">
            AI-Powered Analysis
          </p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            Measure the world's
            <br />
            <span className="text-accent">footprint.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            SmartGeo provides instant dimensional analysis and suitability scoring for civil infrastructure using high-resolution satellite data.
          </p>
          <Link
            to="/map"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-surface hover:brightness-110 transition-all duration-200"
          >
            Start Analysis
            <MapPin className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Features */}
    <section className="py-20 px-6 bg-secondary/50">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold text-foreground text-center mb-12">
          Platform Features
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className={`p-6 bg-card rounded-2xl shadow-surface relative ${f.future ? "opacity-60" : ""}`}
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
              {f.future && (
                <span className="absolute top-4 right-4 px-2 py-0.5 bg-secondary text-[10px] font-bold uppercase tracking-wider rounded text-muted-foreground">
                  Coming Soon
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Home;
