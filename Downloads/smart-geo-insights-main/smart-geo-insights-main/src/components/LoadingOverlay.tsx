import { motion } from "framer-motion";

const LoadingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
  >
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-1 rounded-full border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <p className="text-sm font-medium text-muted-foreground">Analyzing region...</p>
      <motion.div
        className="w-48 h-1 bg-secondary rounded-full overflow-hidden"
      >
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: [0.2, 0, 0, 1] }}
        />
      </motion.div>
    </div>
  </motion.div>
);

export default LoadingOverlay;
