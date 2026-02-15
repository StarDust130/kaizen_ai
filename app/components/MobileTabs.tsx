import { motion, AnimatePresence } from "framer-motion";
import { PenTool, Eye } from "lucide-react";
import type { TabKey } from "../lib/types";

interface MobileTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  hasOutput: boolean;
  loading: boolean;
}

export default function MobileTabs({
  activeTab,
  onTabChange,
  hasOutput,
  loading,
}: MobileTabsProps) {
  const tabs = [
    { key: "create" as const, icon: PenTool, label: "Create" },
    { key: "preview" as const, icon: Eye, label: "Preview" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="lg:hidden px-4 pt-3 shrink-0 z-20 relative"
      >
        <div className="flex bg-white p-1 rounded-xl border-[3px] border-black shadow-[3px_3px_0px_#000]">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                activeTab === tab.key
                  ? "bg-black text-[#BEF264]"
                  : "text-gray-400 hover:text-black active:bg-gray-100"
              }`}
              whileTap={{ scale: 0.97 }}
              layout
            >
              <tab.icon size={13} strokeWidth={3} /> {tab.label}
              {tab.key === "preview" && hasOutput && !loading && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-[#BEF264] rounded-full border border-black"
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
