import { motion } from "framer-motion";

interface ResultCardProps {
  label: string;
  value: string;
  unit?: string;
  isFuture?: boolean;
  icon: React.ReactNode;
}

const ResultCard = ({ label, value, unit, isFuture, icon }: ResultCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
    className={`p-6 bg-card rounded-2xl shadow-surface ${isFuture ? "opacity-60 grayscale" : ""}`}
  >
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
        {isFuture ? "Coming Soon" : value}
      </span>
      {!isFuture && unit && <span className="text-sm text-muted-foreground">{unit}</span>}
    </div>
    {isFuture && (
      <span className="mt-3 inline-block px-2 py-0.5 bg-secondary text-[10px] font-bold uppercase tracking-wider rounded text-muted-foreground">
        Research Phase
      </span>
    )}
  </motion.div>
);

export default ResultCard;
