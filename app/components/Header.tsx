import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { GitHubIcon } from "./icons";

interface HeaderProps {
  historySlot?: React.ReactNode;
}

export default function Header({ historySlot }: HeaderProps) {
  return (
    <nav className="shrink-0 border-b-[3px] border-black px-4 sm:px-6 py-3 bg-white z-50 relative">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            className="bg-black p-2 rounded-xl text-[#BEF264] shadow-[3px_3px_0px_#BEF264] border-[3px] border-black"
            whileHover={{ rotate: -12, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Zap size={18} fill="currentColor" />
          </motion.div>
          <h1 className="text-lg sm:text-xl font-black tracking-tighter">
            KAIZEN<span className="text-[#65A30D]">.AI</span>
          </h1>
        </motion.div>

        {/* Nav links */}
        <div className="flex items-center gap-2">
          {historySlot}

          <motion.a
            href="https://csyadav.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#BEF264] text-black border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] font-black text-[10px] uppercase tracking-widest cursor-pointer"
            whileHover={{ x: 1.5, y: 1.5, boxShadow: "0px 0px 0px #000" }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <Zap size={14} fill="currentColor" />
            <span className="hidden sm:inline">MY Portfolio</span>
          </motion.a>

        

          <motion.a
            href="https://github.com/StarDust130/kaizen_ai"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#111827] text-white border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] font-black text-[10px] uppercase tracking-widest cursor-pointer"
            whileHover={{ x: 1.5, y: 1.5, boxShadow: "0px 0px 0px #000" }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <GitHubIcon size={14} />
            <span className="hidden sm:inline">GitHub</span>
          </motion.a>
        </div>
      </div>
    </nav>
  );
}
