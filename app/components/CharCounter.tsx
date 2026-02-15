import { motion } from "framer-motion";
import { TOPIC_MAX_LENGTH } from "../lib/constants";

interface CharCounterProps {
  current: number;
  max?: number;
}

export default function CharCounter({
  current,
  max = TOPIC_MAX_LENGTH,
}: CharCounterProps) {
  const percentage = (current / max) * 100;
  const isNear = percentage > 80;
  const isOver = percentage > 100;

  if (current === 0) return null;

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Progress ring */}
      <svg width="20" height="20" className="-rotate-90">
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="2.5"
        />
        <motion.circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke={isOver ? "#EF4444" : isNear ? "#F59E0B" : "#84CC16"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 8}`}
          strokeDashoffset={`${2 * Math.PI * 8 * (1 - Math.min(percentage, 100) / 100)}`}
          initial={false}
          animate={{
            strokeDashoffset:
              2 * Math.PI * 8 * (1 - Math.min(percentage, 100) / 100),
          }}
          transition={{ duration: 0.3 }}
        />
      </svg>
      <span
        className={`text-[10px] font-black tabular-nums ${
          isOver ? "text-red-500" : isNear ? "text-amber-500" : "text-gray-400"
        }`}
      >
        {current}/{max}
      </span>
    </motion.div>
  );
}
