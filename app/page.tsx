"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Copy,
  Sparkles,
  RefreshCcw,
  Send,
  ChevronDown,
  PenTool,
  Eye,
  ExternalLink,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const GitHubIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedInIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function KaizenAI() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [formData, setFormData] = useState({
    topic: "",
    tone: "Professional",
    audience: "",
    model: "llama-3.3-70b-versatile",
  });

  const [hasStarted, setHasStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "preview">("create");

  const validateField = (text: string) => {
    const input = text.toLowerCase().trim();
    if (input.length < 3) return "too_short";

    const uniqueChars = new Set(input.replace(/[^a-z]/g, "")).size;
    if (input.length > 5 && uniqueChars < 3) return "gibberish";
    if (/(.)\1{3,}/.test(input)) return "gibberish";

    const forbiddenTriggers = [
      "ignore previous",
      "system prompt",
      "jailbreak",
      "act as",
      "write code",
      "python",
      "javascript",
      "console.log",
      "recipe",
      "weather",
      "solve",
      "calculate",
      "bomb",
    ];
    if (forbiddenTriggers.some((t) => input.includes(t))) return "irrelevant";

    const badWords = ["fuck", "shit", "bitch", "asshole", "scam"];
    if (badWords.some((w) => input.includes(w))) return "profanity";

    return "safe";
  };

  useEffect(() => {
    if (output && !loading) {
      let i = 0;
      setStreamedText("");
      const interval = setInterval(() => {
        setStreamedText(output.slice(0, i + 1));
        i++;
        if (i >= output.length) clearInterval(interval);
      }, 5);
      return () => clearInterval(interval);
    } else if (loading) {
      setStreamedText("");
    }
  }, [output, loading]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (
        formData.topic.length > 8 &&
        validateField(formData.topic) === "safe"
      ) {
        try {
          const res = await fetch("/api/suggest", {
            method: "POST",
            body: JSON.stringify({ text: formData.topic }),
          });
          const data = await res.json();
          setSuggestion(data.suggestion || "");
        } catch {
          console.error("Suggest fail");
        }
      } else {
        setSuggestion("");
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [formData.topic]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Tab" || e.key === "ArrowRight") && suggestion) {
      e.preventDefault();
      setFormData((prev) => ({ ...prev, topic: prev.topic + suggestion }));
      setSuggestion("");
    }
  };

  const handleGenerate = async () => {
    if (!formData.audience.trim()) return toast.error("Who is this for?");
    if (!formData.topic.trim()) return toast.error("Please enter a topic.");

    const topicStatus = validateField(formData.topic);
    if (topicStatus !== "safe") {
      toast("Invalid topic. Keep it professional.", {
        style: {
          border: "2px solid #000",
          background: "#FDE047",
          color: "#000",
          fontWeight: "bold",
        },
        icon: "🚧",
      });
      return;
    }

    setLoading(true);
    setHasStarted(true);
    setSuggestion("");

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setActiveTab("preview");
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setOutput(data.content);
      toast.success("Generated!");
    } catch {
      toast.error("Failed");
      setActiveTab("create");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (action: "shorten" | "refine" | "retry") => {
    if (!output) return;
    setLoading(true);
    const toastId = toast.loading("Refining...");
    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentText: output,
          action,
          topic: formData.topic,
        }),
      });
      const data = await res.json();
      setOutput(data.content);
      toast.success("Updated!", { id: toastId });
    } catch {
      toast.error("Failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh bg-[#FFFDF7] text-[#111827] font-sans flex flex-col font-medium selection:bg-[#BEF264] selection:text-black overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#111827",
            color: "#fff",
            border: "2px solid #000",
            boxShadow: "4px 4px 0px #000",
            fontWeight: 700,
            fontSize: "13px",
          },
        }}
      />

      {/* GRAIN OVERLAY */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* HEADER */}
      <nav className="shrink-0 border-b-[3px] border-black px-4 sm:px-6 py-3 bg-white z-50 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
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

          <div className="flex items-center gap-2">
            {/* LinkedIn */}
            <motion.a
              href="https://www.linkedin.com/in/stardust130"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0077B5] text-white border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] font-black text-[10px] uppercase tracking-widest cursor-pointer"
              whileHover={{
                x: 1.5,
                y: 1.5,
                boxShadow: "0px 0px 0px #000",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <LinkedInIcon size={14} />
              <span className="hidden sm:inline">LinkedIn</span>
            </motion.a>

            {/* GitHub */}
            <motion.a
              href="https://github.com/StarDust130/kaizen_ai"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-[#111827] text-white border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] font-black text-[10px] uppercase tracking-widest cursor-pointer"
              whileHover={{
                x: 1.5,
                y: 1.5,
                boxShadow: "0px 0px 0px #000",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <GitHubIcon size={14} />
              <span className="hidden sm:inline">GitHub</span>
            </motion.a>
          </div>
        </div>
      </nav>

      {/* MOBILE TABS */}
      <AnimatePresence>
        {hasStarted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden px-4 pt-3 shrink-0 z-20 relative"
          >
            <div className="flex bg-white p-1 rounded-xl border-[3px] border-black shadow-[3px_3px_0px_#000]">
              {[
                { key: "create" as const, icon: PenTool, label: "Create" },
                { key: "preview" as const, icon: Eye, label: "Preview" },
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                    activeTab === tab.key
                      ? "bg-black text-[#BEF264]"
                      : "text-gray-400 hover:text-black"
                  }`}
                  whileTap={{ scale: 0.97 }}
                  layout
                >
                  <tab.icon size={13} strokeWidth={3} /> {tab.label}
                  {tab.key === "preview" && output && !loading && (
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
        )}
      </AnimatePresence>

      {/* MAIN */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 flex items-center justify-center relative z-10 h-full overflow-hidden">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className={`w-full grid gap-4 lg:gap-5 h-full items-start transition-all duration-500 ${
            hasStarted
              ? "grid-cols-1 lg:grid-cols-12"
              : "grid-cols-1 place-items-center"
          }`}
        >
          {/* LEFT: INPUT */}
          <motion.div
            layout
            className={`bg-white border-[3px] border-black shadow-[5px_5px_0px_#000] rounded-2xl flex flex-col overflow-hidden ${
              activeTab === "create" ? "flex" : "hidden lg:flex"
            } ${
              hasStarted
                ? "lg:col-span-5 h-full"
                : "w-full max-w-xl h-auto max-h-[85vh]"
            }`}
          >
            <div className="flex-1 flex flex-col p-4 sm:p-5 gap-3 sm:gap-4 overflow-y-auto custom-scrollbar">
              {/* Card Header */}
              <div className="flex justify-between items-center border-b-2 border-gray-100 pb-3 shrink-0">
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                    <motion.span
                      className="inline-block w-2 h-5 bg-[#BEF264] rounded-sm border-2 border-black"
                      animate={{ scaleY: [1, 1.2, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                      }}
                    />
                    CREATE POST
                  </h2>
                  {!hasStarted && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest"
                    >
                      Let&#39;s go viral today. 🚀
                    </motion.p>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {["#BEF264", "#FDE047", "#FB923C"].map((color, i) => (
                    <motion.div
                      key={color}
                      className="w-3 h-3 rounded-full border-2 border-black"
                      style={{ backgroundColor: color }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 * i, type: "spring" }}
                    />
                  ))}
                </div>
              </div>

              {/* Audience */}
              <motion.div
                className="space-y-1.5 shrink-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Target Audience
                </label>
                <input
                  placeholder="Ex: SaaS Founders, Developers..."
                  className="w-full bg-[#FAFAF9] border-[3px] border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:shadow-[3px_3px_0px_#BEF264] transition-all font-bold placeholder:text-gray-300 text-sm"
                  onChange={(e) =>
                    setFormData({ ...formData, audience: e.target.value })
                  }
                />
              </motion.div>

              {/* Topic */}
              <motion.div
                className="flex flex-col flex-1 space-y-1.5 min-h-40 relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Topic / Core Idea
                </label>
                <div className="flex-1 relative bg-[#FAFAF9] border-[3px] border-gray-200 rounded-xl focus-within:border-black focus-within:shadow-[3px_3px_0px_#BEF264] transition-all flex flex-col">
                  <div className="absolute top-4 left-4 pointer-events-none whitespace-pre-wrap font-bold text-gray-300 z-0 text-sm leading-relaxed p-0.5">
                    <span className="opacity-0">{formData.topic}</span>
                    <span className="text-gray-400/50">{suggestion}</span>
                  </div>
                  <textarea
                    value={formData.topic}
                    onKeyDown={handleKeyDown}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className="flex-1 w-full bg-transparent p-4 outline-none relative z-10 resize-none font-bold text-[#111827] text-sm leading-relaxed placeholder:text-gray-300"
                    placeholder="Start typing your idea..."
                  />
                  <AnimatePresence>
                    {suggestion && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 5 }}
                        className="absolute bottom-3 right-3 text-[9px] font-black text-black bg-[#BEF264] px-2.5 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]"
                      >
                        TAB ↹
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Selects */}
              <motion.div
                className="shrink-0 grid grid-cols-2 gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Tone
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-white border-[3px] border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-black focus:shadow-[2px_2px_0px_#BEF264] font-bold text-xs appearance-none cursor-pointer"
                      onChange={(e) =>
                        setFormData({ ...formData, tone: e.target.value })
                      }
                    >
                      <option>Professional</option>
                      <option>Storyteller</option>
                      <option>Contrarian</option>
                      <option>Direct</option>
                      <option>Super Chill 🤙</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={13}
                      strokeWidth={3}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Model
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-white border-[3px] border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-black focus:shadow-[2px_2px_0px_#BEF264] font-bold text-xs appearance-none cursor-pointer"
                      onChange={(e) =>
                        setFormData({ ...formData, model: e.target.value })
                      }
                    >
                      <option value="llama-3.3-70b-versatile">Llama 3.3</option>
                      <option value="llama-3.1-8b-instant">Llama 3.1</option>
                      <option value="mixtral-8x7b-32768">Mixtral</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={13}
                      strokeWidth={3}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* GENERATE BUTTON */}
            <div className="p-4 sm:p-5 bg-white border-t-[3px] border-black shrink-0">
              <motion.button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3.5 bg-black text-[#BEF264] border-[3px] border-black text-sm rounded-xl font-black uppercase tracking-wider shadow-[4px_4px_0px_#84CC16] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
                whileHover={
                  !loading
                    ? { x: 2, y: 2, boxShadow: "0px 0px 0px #84CC16" }
                    : {}
                }
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                  >
                    <RefreshCcw size={17} />
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                      }}
                    >
                      <Sparkles size={17} />
                    </motion.div>
                    GENERATE
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* RIGHT: PREVIEW */}
          <AnimatePresence>
            {hasStarted && (
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
                            loading ? "bg-[#FDE047]" : "bg-[#BEF264]"
                          }`}
                          animate={loading ? { scale: [1, 1.4, 1] } : {}}
                          transition={{
                            repeat: Infinity,
                            duration: 0.8,
                          }}
                        />
                        {loading ? "Thinking..." : "Ready"}
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
                            toast.success("Copied!");
                          }}
                          className="p-2.5 bg-white border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] text-black"
                          whileHover={{
                            x: 1.5,
                            y: 1.5,
                            boxShadow: "0px 0px 0px #000",
                          }}
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
                          whileHover={{
                            x: 1.5,
                            y: 1.5,
                            boxShadow: "0px 0px 0px #000",
                          }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <LinkedInIcon size={13} />
                          <span className="hidden sm:inline">Post</span>
                          <ExternalLink
                            size={11}
                            strokeWidth={3}
                            className="sm:hidden"
                          />
                        </motion.button>
                      </motion.div>
                    )}
                  </div>

                  {output && !loading && (
                    <motion.div
                      className="flex gap-2 overflow-x-auto pb-1 no-scrollbar"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {(
                        [
                          { label: "✂️ Shorten", action: "shorten" },
                          { label: "✨ Refine", action: "refine" },
                          { label: "🔄 Retry", action: "retry" },
                        ] as const
                      ).map((item, i) => (
                        <motion.button
                          key={item.action}
                          onClick={() => handleEdit(item.action)}
                          className="flex-1 py-2 px-3 sm:px-4 bg-white border-[3px] border-black rounded-xl text-[10px] font-black uppercase text-black hover:bg-[#ecfccb] transition-colors whitespace-nowrap shadow-[2px_2px_0px_#000]"
                          whileHover={{
                            y: 1,
                            boxShadow: "0px 0px 0px #000",
                          }}
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
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 bg-white custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4 pt-8 max-w-xl mx-auto"
                      >
                        {[100, 85, 65, 45, 70].map((w, i) => (
                          <motion.div
                            key={i}
                            className="h-4 bg-gray-100 rounded-lg border-2 border-gray-200"
                            style={{ width: `${w}%` }}
                            initial={{ scaleX: 0, originX: 0 }}
                            animate={{
                              scaleX: 1,
                              opacity: [0.4, 0.8, 0.4],
                            }}
                            transition={{
                              scaleX: {
                                duration: 0.4,
                                delay: i * 0.1,
                              },
                              opacity: {
                                repeat: Infinity,
                                duration: 1.2,
                                delay: i * 0.15,
                              },
                            }}
                          />
                        ))}
                        <div className="flex justify-center pt-8">
                          <motion.span
                            className="text-[10px] font-black bg-black text-[#BEF264] px-4 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_#BEF264]"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.2,
                              ease: "easeInOut",
                            }}
                          >
                            ✍️ COOKING...
                          </motion.span>
                        </div>
                      </motion.div>
                    ) : output ? (
                      <motion.div
                        key="output"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="prose prose-lg max-w-none"
                      >
                        <p className="whitespace-pre-wrap text-[#111827] text-[15px] sm:text-[16px] leading-[1.85] font-medium font-sans">
                          {streamedText}
                          <motion.span
                            className="inline-block w-[3px] h-5 bg-[#BEF264] border border-black ml-1 rounded-sm align-middle"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                          />
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full flex flex-col items-center justify-center text-center gap-4"
                      >
                        <motion.div
                          className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border-[3px] border-dashed border-gray-300"
                          animate={{
                            rotate: [0, 3, -3, 0],
                            scale: [1, 1.03, 1],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 4,
                            ease: "easeInOut",
                          }}
                        >
                          <Send size={24} className="text-gray-300" />
                        </motion.div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                          Waiting for input...
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
