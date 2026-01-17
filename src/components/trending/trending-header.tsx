"use client";

import { Flame } from "lucide-react";
import { motion } from "framer-motion";

export function TrendingHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Flame className="h-5 w-5 text-orange-500 fill-orange-500" />
        </motion.div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          TRENDING NOW
        </h2>
      </div>
      <div className="h-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-transparent rounded-full" />
    </motion.div>
  );
}
