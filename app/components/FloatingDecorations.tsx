"use client";

import { motion } from "framer-motion";

export default function FloatingDecorations() {
  return (
    <div className="hidden lg:block fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute top-32 left-8 w-3 h-3 bg-[#BEF264] rounded-full border-2 border-black"
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-64 right-12 w-4 h-4 bg-[#FDE047] rounded-sm border-2 border-black rotate-45"
        animate={{ rotate: [45, 90, 45], scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-40 left-16 w-5 h-5 bg-[#FB923C] rounded-full border-2 border-black"
        animate={{ y: [0, 15, 0] }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute top-48 right-[30%] w-2 h-8 bg-[#BEF264] rounded-sm border-2 border-black"
        animate={{ scaleY: [1, 1.5, 1], rotate: [0, 15, 0] }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}
