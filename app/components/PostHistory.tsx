import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  X,
  Trash2,
  Clock,
  ChevronRight,
  Copy,
  Users,
  Music,
  FileText,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import type { HistoryItem } from "../lib/types";

interface PostHistoryProps {
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onClear: () => void;
  onDelete: (id: string) => void;
}

export default function PostHistory({
  history,
  onLoad,
  onClear,
  onDelete,
}: PostHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Reset confirmClear when panel opens/closes
  useEffect(() => {
    setConfirmClear(false);
    setSearchQuery("");
    setDeletingId(null);
  }, [isOpen]);

  const formatTime = useCallback(
    (ts: number) => {
      const diff = now - ts;
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return `${Math.floor(hrs / 24)}d ago`;
    },
    [now],
  );

  const getWordCount = (text: string) =>
    text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;

  const handleCopy = useCallback(
    (e: React.MouseEvent, content: string) => {
      e.stopPropagation();
      navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard!");
    },
    [],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setDeletingId(id);
      // Small delay so animation plays
      setTimeout(() => {
        onDelete(id);
        setDeletingId(null);
      }, 250);
    },
    [onDelete],
  );

  const handleClearAll = useCallback(() => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    onClear();
    setConfirmClear(false);
    setIsOpen(false);
  }, [confirmClear, onClear]);

  const filteredHistory = searchQuery.trim()
    ? history.filter(
        (item) =>
          item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tone.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : history;

  if (history.length === 0) return null;

  return (
    <>
      {/* Trigger button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 bg-white text-black border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] font-black text-[10px] uppercase tracking-widest cursor-pointer"
        whileHover={{ x: 1.5, y: 1.5, boxShadow: "0px 0px 0px #000" }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        <History size={14} strokeWidth={3} />
        <span className="hidden sm:inline">History</span>
        <span className="inline-flex items-center justify-center w-4 h-4 bg-[#BEF264] text-black text-[8px] font-black rounded-full border border-black">
          {history.length}
        </span>
      </motion.button>

      {/* Slide-over panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-100 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="relative w-full max-w-sm bg-white border-l-[3px] border-black shadow-[-5px_0_15px_rgba(0,0,0,0.1)] flex flex-col h-full"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            >
              {/* Header */}
              <div className="p-4 border-b-[3px] border-black bg-[#FAFAF9] shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-black tracking-tight flex items-center gap-2">
                      <History size={16} strokeWidth={3} />
                      POST HISTORY
                    </h3>
                    <p className="text-[9px] font-bold text-gray-400 mt-0.5">
                      {history.length} generated post{history.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AnimatePresence mode="wait">
                      {confirmClear ? (
                        <motion.button
                          key="confirm"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          onClick={handleClearAll}
                          className="px-2.5 py-1.5 rounded-lg border-2 border-red-400 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
                          whileTap={{ scale: 0.9 }}
                        >
                          <AlertTriangle size={10} />
                          Confirm
                        </motion.button>
                      ) : (
                        <motion.button
                          key="clear"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          onClick={handleClearAll}
                          className="p-2 rounded-lg border-2 border-red-200 text-red-400 hover:bg-red-50 transition-colors"
                          whileTap={{ scale: 0.9 }}
                          title="Clear all history"
                        >
                          <Trash2 size={13} />
                        </motion.button>
                      )}
                    </AnimatePresence>
                    <motion.button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-lg border-2 border-black bg-white hover:bg-gray-50 transition-colors"
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={13} strokeWidth={3} />
                    </motion.button>
                  </div>
                </div>

                {/* Search */}
                {history.length > 3 && (
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search posts..."
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-3 py-2 text-xs font-bold placeholder:text-gray-300 focus:border-black focus:outline-none transition-colors"
                  />
                )}
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                <AnimatePresence>
                  {filteredHistory.map((item, i) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: deletingId === item.id ? 0 : 1,
                        y: 0,
                        x: deletingId === item.id ? 80 : 0,
                        scale: deletingId === item.id ? 0.9 : 1,
                      }}
                      exit={{ opacity: 0, x: 80, scale: 0.9 }}
                      transition={{ delay: deletingId === item.id ? 0 : i * 0.03 }}
                      className="relative group"
                    >
                      <button
                        onClick={() => {
                          onLoad(item);
                          setIsOpen(false);
                        }}
                        className="w-full text-left p-3 bg-[#FAFAF9] border-2 border-gray-200 rounded-xl hover:border-black hover:shadow-[2px_2px_0px_#000] transition-all"
                      >
                        {/* Topic & load arrow */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-xs font-black text-gray-800 truncate flex-1">
                            {item.topic}
                          </p>
                          <ChevronRight
                            size={14}
                            className="text-gray-300 group-hover:text-black transition-colors mt-0.5 shrink-0"
                          />
                        </div>

                        {/* Metadata badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-white border border-gray-200 rounded-md px-1.5 py-0.5">
                            <Clock size={8} />
                            {formatTime(item.createdAt)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-white border border-gray-200 rounded-md px-1.5 py-0.5">
                            <Music size={8} />
                            {item.tone}
                          </span>
                          {item.audience && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-white border border-gray-200 rounded-md px-1.5 py-0.5">
                              <Users size={8} />
                              {item.audience.length > 18
                                ? item.audience.slice(0, 18) + "…"
                                : item.audience}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-white border border-gray-200 rounded-md px-1.5 py-0.5">
                            <FileText size={8} />
                            {getWordCount(item.content)}w
                          </span>
                        </div>

                        {/* Content preview */}
                        <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                          {item.content.slice(0, 120)}
                          {item.content.length > 120 ? "..." : ""}
                        </p>
                      </button>

                      {/* Action buttons - shown on hover */}
                      <div className="absolute top-2 right-8 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          onClick={(e) => handleCopy(e, item.content)}
                          className="p-1.5 bg-white border-2 border-gray-200 rounded-lg text-gray-400 hover:text-black hover:border-black transition-colors"
                          whileTap={{ scale: 0.85 }}
                          title="Copy content"
                        >
                          <Copy size={11} />
                        </motion.button>
                        <motion.button
                          onClick={(e) => handleDelete(e, item.id)}
                          className="p-1.5 bg-white border-2 border-red-200 rounded-lg text-red-400 hover:text-red-600 hover:border-red-400 transition-colors"
                          whileTap={{ scale: 0.85 }}
                          title="Delete this post"
                        >
                          <Trash2 size={11} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredHistory.length === 0 && searchQuery && (
                  <div className="text-center py-8">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                      No matches found
                    </p>
                  </div>
                )}
              </div>

              {/* Footer with count */}
              <div className="shrink-0 px-4 py-2.5 border-t-[3px] border-black bg-[#FAFAF9]">
                <p className="text-[9px] font-bold text-gray-400 text-center tracking-wider uppercase">
                  {filteredHistory.length} of {history.length} posts
                  {searchQuery && " matching"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
