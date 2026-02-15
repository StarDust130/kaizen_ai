import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Send,
  ExternalLink,
  FileText,
  Clock,
  TrendingUp,
  Pencil,
  X,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { LinkedInIcon } from "./icons";
import { EDIT_ACTIONS } from "../lib/constants";
import { validateField } from "../lib/validation";
import type { EditAction, TabKey } from "../lib/types";

interface PostPreviewProps {
  output: string;
  streamedText: string;
  loading: boolean;
  activeTab: TabKey;
  onEdit: (action: EditAction) => void;
  onCustomEdit: (selectedText: string, instruction: string) => void;
  onSkip: () => void;
}

export default function PostPreview({
  output,
  streamedText,
  loading,
  activeTab,
  onEdit,
  onCustomEdit,
  onSkip,
}: PostPreviewProps) {
  const wordCount = useMemo(() => {
    if (!output) return 0;
    return output
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
  }, [output]);

  const readTime = useMemo(() => {
    const minutes = Math.ceil(wordCount / 200);
    return minutes < 1 ? "< 1 min" : `${minutes} min`;
  }, [wordCount]);

  // LinkedIn engagement score (0-100)
  const engagementScore = useMemo(() => {
    if (!output) return 0;
    let score = 50;
    if (wordCount >= 80 && wordCount <= 250) score += 15;
    else if (wordCount >= 50 && wordCount <= 300) score += 8;
    else if (wordCount < 30 || wordCount > 400) score -= 10;
    const lineBreaks = (output.match(/\n/g) || []).length;
    if (lineBreaks >= 3 && lineBreaks <= 15) score += 10;
    const emojiCount = (
      output.match(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
      ) || []
    ).length;
    if (emojiCount >= 1 && emojiCount <= 6) score += 8;
    else if (emojiCount > 8) score -= 5;
    const hashtags = (output.match(/#\w+/g) || []).length;
    if (hashtags >= 2 && hashtags <= 5) score += 8;
    if (/\?\s*$/.test(output.trim())) score += 7;
    if (/\d+/.test(output)) score += 5;
    const paragraphs = output.split(/\n\s*\n/).filter((p) => p.trim());
    const avgParaLen =
      paragraphs.reduce((s, p) => s + p.split(/\s+/).length, 0) /
      Math.max(paragraphs.length, 1);
    if (avgParaLen <= 30) score += 5;
    return Math.min(100, Math.max(0, score));
  }, [output, wordCount]);

  const scoreColor =
    engagementScore >= 75
      ? "#BEF264"
      : engagementScore >= 50
        ? "#FDE047"
        : "#FB923C";
  const scoreLabel =
    engagementScore >= 75
      ? "\u{1F525} High"
      : engagementScore >= 50
        ? "\u{1F44D} Good"
        : "\u{1F4A1} Improve";

  // Is text still streaming in?
  const isStreaming = !!(output && streamedText !== output);
  const isGenerating = loading || isStreaming;

  // ── Selection edit state ───────────────────────────────────────────
  const [selectedText, setSelectedText] = useState("");
  const [editInstruction, setEditInstruction] = useState("");
  const [editError, setEditError] = useState("");
  const [showEditBar, setShowEditBar] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  const dismissEditBar = useCallback(() => {
    setShowEditBar(false);
    setSelectedText("");
    setEditInstruction("");
    setEditError("");
    window.getSelection()?.removeAllRanges();
  }, []);

  // Ref to track if edit bar is open (avoids stale closure in selectionchange)
  const showEditBarRef = useRef(false);
  useEffect(() => {
    showEditBarRef.current = showEditBar;
  }, [showEditBar]);

  // Track if the user is interacting with the edit bar input (prevent dismiss)
  const editBarTouchedRef = useRef(false);

  // Check current selection and show/dismiss edit bar
  const processSelection = useCallback(() => {
    if (loading || isStreaming) return;
    // Don't dismiss if user is interacting with the edit bar
    if (editBarTouchedRef.current) return;
    const selection = window.getSelection();
    const text =
      selection && !selection.isCollapsed ? selection.toString().trim() : "";
    if (text.length >= 3) {
      setSelectedText(text);
      setEditInstruction("");
      setEditError("");
      setShowEditBar(true);
      // Clear the native browser selection so Android stops showing
      // the Google "Tap to see search results" smart selection bar.
      // We already captured the text into state, so we don't need it.
      requestAnimationFrame(() => {
        window.getSelection()?.removeAllRanges();
        // Auto-focus on desktop only
        if (window.matchMedia("(pointer: fine)").matches) {
          editInputRef.current?.focus();
        }
      });
    } else if (showEditBarRef.current) {
      dismissEditBar();
    }
  }, [loading, isStreaming, dismissEditBar]);

  // Use selectionchange event — works reliably on mobile
  const contentRef = useRef<HTMLDivElement>(null);
  const selectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const handleSelectionChange = () => {
      // Debounce: wait until the user stops adjusting the selection handles
      // before processing. This prevents clearing the selection too early
      // while the user is still dragging.
      if (selectionTimerRef.current) clearTimeout(selectionTimerRef.current);
      selectionTimerRef.current = setTimeout(() => {
        const sel = window.getSelection();
        if (
          sel &&
          sel.rangeCount > 0 &&
          contentRef.current?.contains(sel.anchorNode)
        ) {
          processSelection();
        }
      }, 300);
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      if (selectionTimerRef.current) clearTimeout(selectionTimerRef.current);
    };
  }, [processSelection]);

  // React event handler as fallback for desktop
  const handleTextSelection = useCallback(() => {
    if (loading || isStreaming) return;
    setTimeout(() => processSelection(), 10);
  }, [loading, isStreaming, processSelection]);

  // Close edit bar when output changes
  useEffect(() => {
    setShowEditBar(false);
    setSelectedText("");
    setEditInstruction("");
    setEditError("");
  }, [output]);

  const validateEditInstruction = useCallback((value: string): string => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return "Tell the AI what to do with this text";
    if (trimmed.length < 5) return "Be more specific (at least 5 characters)";
    if (trimmed.length > 200) return "Keep it under 200 characters";
    const status = validateField(trimmed);
    if (status === "gibberish")
      return "That doesn't look like a real instruction";
    if (status === "profanity") return "Keep it professional";
    if (status === "irrelevant")
      return "Please enter a genuine editing instruction";
    return "";
  }, []);

  // Render text with highlight on the selected portion
  const highlightedText = useMemo(() => {
    if (!showEditBar || !selectedText || !streamedText) return null;
    const idx = streamedText.indexOf(selectedText);
    if (idx === -1) return null;
    const before = streamedText.slice(0, idx);
    const after = streamedText.slice(idx + selectedText.length);
    return (
      <>
        {before}
        <mark className="bg-[#BEF264]/40 text-inherit rounded-sm box-decoration-clone px-0.5 -mx-0.5 transition-colors duration-300">
          {selectedText}
        </mark>
        {after}
      </>
    );
  }, [showEditBar, selectedText, streamedText]);

  const handleEditSubmit = useCallback(() => {
    const error = validateEditInstruction(editInstruction);
    if (error) {
      setEditError(error);
      return;
    }
    onCustomEdit(selectedText, editInstruction.trim());
    setShowEditBar(false);
    setSelectedText("");
    setEditInstruction("");
    setEditError("");
  }, [selectedText, editInstruction, onCustomEdit, validateEditInstruction]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{
        delay: 0.05,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`bg-white rounded-2xl border-[3px] border-black shadow-[5px_5px_0px_#000] flex-col overflow-hidden relative h-full ${
        activeTab === "preview" ? "flex" : "hidden lg:flex"
      } lg:col-span-7`}
    >
      {/* Toolbar */}
      <div className="shrink-0 px-4 sm:px-5 py-3 sm:py-4 border-b-[3px] border-black bg-[#FAFAF9] flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              <span className="inline-block w-2 h-5 bg-black rounded-sm" />
              OUTPUT
            </h2>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-0.5">
              <motion.div
                className={`w-2 h-2 rounded-full border-2 border-black ${
                  loading
                    ? "bg-[#FDE047]"
                    : isStreaming
                      ? "bg-[#BEF264]"
                      : "bg-[#BEF264]"
                }`}
                animate={
                  loading
                    ? { scale: [1, 1.4, 1] }
                    : isStreaming
                      ? { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }
                      : {}
                }
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
              {loading ? "Thinking..." : isStreaming ? "Writing..." : "Ready"}
            </span>
          </div>
          {output && !loading && (
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  toast.success("Copied to clipboard!");
                }}
                className="p-2.5 bg-white border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] text-black"
                whileHover={{ x: 1.5, y: 1.5, boxShadow: "0px 0px 0px #000" }}
                whileTap={{ scale: 0.9 }}
                title="Copy to clipboard"
              >
                <Copy size={15} strokeWidth={3} />
              </motion.button>
              <motion.button
                onClick={() =>
                  window.open(
                    `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(output)}`,
                    "_blank",
                  )
                }
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-[10px] font-black uppercase bg-[#0077B5] text-white border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000]"
                whileHover={{ x: 1.5, y: 1.5, boxShadow: "0px 0px 0px #000" }}
                whileTap={{ scale: 0.9 }}
              >
                <LinkedInIcon size={13} />
                <span className="hidden sm:inline">Post</span>
                <ExternalLink size={11} strokeWidth={3} className="sm:hidden" />
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Edit actions — only show after streaming */}
        {output && !loading && !isStreaming && (
          <motion.div
            className="grid grid-cols-3 gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {EDIT_ACTIONS.map((item, i) => (
              <motion.button
                key={item.action}
                onClick={() => onEdit(item.action)}
                className="py-2 px-2 sm:px-4 bg-white border-[3px] border-black rounded-xl text-[10px] font-black uppercase text-black hover:bg-[#ecfccb] active:bg-[#d9f99d] transition-colors shadow-[2px_2px_0px_#000] truncate"
                whileHover={{ y: 1, boxShadow: "0px 0px 0px #000" }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
              >
                {item.label}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Stats — only after streaming */}
        {output && !loading && !isStreaming && (
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
              <FileText size={10} />
              <span>{wordCount} words</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
              <Clock size={10} />
              <span>{readTime} read</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
              <TrendingUp size={10} />
              <span>
                Score:{" "}
                <span className="font-black" style={{ color: scoreColor }}>
                  {engagementScore}
                </span>
                /100 <span className="text-[8px]">{scoreLabel}</span>
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 bg-white custom-scrollbar relative">
        {/* Skip button — sticky at top so it doesn't scroll away */}
        <AnimatePresence>
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.5 }}
              className="sticky top-0 z-20 flex justify-end mb-3"
            >
              <button
                onClick={onSkip}
                className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-wider px-3 py-1.5 border-2 border-gray-200 rounded-lg hover:border-black transition-colors bg-white/90 backdrop-blur-sm shadow-sm"
              >
                Skip Animation ⏭
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {output || loading ? (
            <motion.div
              ref={contentRef}
              key="output"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="prose prose-lg max-w-none"
              onMouseUp={handleTextSelection}
              onContextMenu={(e) => {
                // Prevent browser context menu ("Search Google" etc.) on mobile
                // so our custom edit bar can appear instead
                const sel = window.getSelection();
                if (
                  sel &&
                  !sel.isCollapsed &&
                  sel.toString().trim().length >= 3
                ) {
                  e.preventDefault();
                }
              }}
            >
              {/* Text content — just rendered cleanly with a cursor */}
              <p className="whitespace-pre-wrap text-[#111827] text-[15px] sm:text-[16px] leading-[1.85] font-medium font-sans selection:bg-[#BEF264]/40 selection:text-black">
                {highlightedText ?? streamedText}
                {/* Cursor */}
                {isGenerating && (
                  <motion.span
                    className="inline-block w-[2.5px] h-[1.1em] ml-[1px] rounded-[1px] align-middle"
                    style={{ backgroundColor: "#000" }}
                    animate={{ opacity: [1, 1, 0, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      ease: "linear",
                    }}
                  />
                )}
              </p>

              {/* Done divider with selection hint */}
              {!isGenerating && streamedText === output && output && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="mt-6 flex items-center gap-3"
                >
                  <motion.div
                    className="h-px flex-1 bg-gray-100"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  />
                  {!showEditBar && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="text-[9px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5 shrink-0"
                    >
                      <Pencil size={9} />
                      Select text to edit with AI
                    </motion.p>
                  )}
                  <motion.div
                    className="h-px flex-1 bg-gray-100"
                    initial={{ scaleX: 0, originX: 1 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  />
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center gap-4"
            >
              <motion.div
                className="w-14 h-14 bg-gray-50/80 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                }}
              >
                <Send size={20} className="text-gray-300" />
              </motion.div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                  Your post will appear here
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selection Edit Bar */}
        <AnimatePresence>
          {showEditBar && selectedText && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="sticky bottom-0 left-0 right-0 mt-4 bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_#000] overflow-hidden z-20"
              onTouchStart={() => {
                editBarTouchedRef.current = true;
              }}
              onTouchEnd={() => {
                setTimeout(() => {
                  editBarTouchedRef.current = false;
                }, 300);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 pt-3 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                    <Pencil size={10} strokeWidth={3} />
                    Edit Selection
                  </span>
                  <motion.button
                    onClick={dismissEditBar}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={14} strokeWidth={3} className="text-gray-400" />
                  </motion.button>
                </div>
                <div className="bg-[#BEF264]/20 border-2 border-[#BEF264] rounded-lg px-3 py-2 mb-2">
                  <p className="text-[11px] font-bold text-gray-600 line-clamp-2 leading-relaxed">
                    &ldquo;{selectedText}&rdquo;
                  </p>
                </div>
              </div>
              <div className="px-4 pb-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      ref={editInputRef}
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="sentences"
                      spellCheck={false}
                      enterKeyHint="send"
                      data-form-type="other"
                      value={editInstruction}
                      onChange={(e) => {
                        setEditInstruction(e.target.value);
                        if (editError)
                          setEditError(validateEditInstruction(e.target.value));
                      }}
                      onBlur={() => {
                        if (editInstruction.trim())
                          setEditError(
                            validateEditInstruction(editInstruction),
                          );
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleEditSubmit();
                        }
                        if (e.key === "Escape") dismissEditBar();
                      }}
                      onTouchStart={(e) => e.stopPropagation()}
                      placeholder="Make this more engaging..."
                      maxLength={200}
                      className={`w-full bg-[#FAFAF9] border-[3px] rounded-xl px-3 py-2.5 outline-none transition-all font-bold text-xs placeholder:text-gray-300 ${
                        editError
                          ? "border-red-300 focus:border-red-500 focus:shadow-[2px_2px_0px_#FCA5A5]"
                          : "border-gray-200 focus:border-black focus:shadow-[2px_2px_0px_#BEF264]"
                      }`}
                    />
                  </div>
                  <motion.button
                    onClick={handleEditSubmit}
                    className="px-4 py-2.5 bg-black text-[#BEF264] border-[3px] border-black rounded-xl font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_#84CC16] flex items-center gap-1.5 shrink-0"
                    whileHover={{
                      x: 1,
                      y: 1,
                      boxShadow: "0px 0px 0px #84CC16",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles size={12} />
                    Edit
                  </motion.button>
                </div>
                {editError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1.5"
                  >
                    <AlertCircle size={10} />
                    {editError}
                  </motion.p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    "Make it punchier",
                    "Add a statistic",
                    "More professional",
                    "Simplify this",
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setEditInstruction(s);
                        setEditError("");
                        editInputRef.current?.focus();
                      }}
                      className="text-[9px] font-bold text-gray-400 bg-gray-50 border-2 border-gray-200 rounded-lg px-2 py-1 hover:border-black hover:text-black transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
