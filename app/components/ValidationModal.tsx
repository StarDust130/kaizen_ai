import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ValidationError } from "../lib/types";

interface ValidationModalProps {
  error: ValidationError | null;
  onClose: () => void;
}

export default function ValidationModal({
  error,
  onClose,
}: ValidationModalProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-white border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_#000] overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {/* Header stripe */}
            <div className="h-2 bg-linear-to-r from-[#BEF264] via-[#FDE047] to-[#FB923C]" />

            {/* Content */}
            <div className="p-6">
              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg border-2 border-black bg-white hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={14} strokeWidth={3} />
              </motion.button>

              {/* Icon */}
              <motion.div
                className="w-16 h-16 mx-auto mb-4 bg-[#FEF3C7] rounded-2xl border-[3px] border-black shadow-[3px_3px_0px_#000] flex items-center justify-center text-3xl"
                initial={{ rotate: -10 }}
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              >
                {error.icon}
              </motion.div>

              {/* Title */}
              <h3 className="text-lg font-black text-center tracking-tight mb-2">
                {error.title}
              </h3>

              {/* Message */}
              <p className="text-sm text-gray-500 font-medium text-center mb-5 leading-relaxed">
                {error.message}
              </p>

              {/* Suggestions */}
              <div className="space-y-2 mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Try something like:
                </p>
                {error.suggestions.map((suggestion, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-2.5 p-3 bg-[#F7FEE7] border-2 border-[#BEF264] rounded-xl"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * (i + 1) }}
                  >
                    <span className="text-[#65A30D] font-bold text-sm mt-0.5">
                      →
                    </span>
                    <span className="text-xs font-bold text-gray-700">
                      {suggestion}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Close Button */}
              <motion.button
                onClick={onClose}
                className="w-full py-3 bg-black text-[#BEF264] border-[3px] border-black rounded-xl font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_#84CC16]"
                whileHover={{ x: 2, y: 2, boxShadow: "0px 0px 0px #84CC16" }}
                whileTap={{ scale: 0.97 }}
              >
                GOT IT
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
