"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Copy,
  Linkedin,
  Sparkles,
  RefreshCcw,
  Scissors,
  Wand2,
  Send,
  ChevronDown,
  Github,
  Ban,
  ShieldAlert,
  PenTool,
  Eye,
  Menu,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

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

  // 🚀 STATE
  const [hasStarted, setHasStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "preview">("create");

  // 🛡️ VALIDATION
  const validateField = (text: string) => {
    const input = text.toLowerCase().trim();
    if (input.length < 3) return "too_short";

    // Gibberish Guard
    const uniqueChars = new Set(input.replace(/[^a-z]/g, "")).size;
    if (input.length > 5 && uniqueChars < 3) return "gibberish";
    if (/(.)\1{3,}/.test(input)) return "gibberish";

    // Irrelevant Guard
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

  // 🧠 Effects
  useEffect(() => {
    if (output && !loading) {
      let i = 0;
      setStreamedText("");
      const interval = setInterval(() => {
        setStreamedText((prev) => output.slice(0, i + 1));
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
        } catch (e) {
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
    } catch (err) {
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
    } catch (err) {
      toast.error("Failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] bg-[#F3F4F6] text-[#111827] font-sans flex flex-col font-medium selection:bg-[#BEF264] selection:text-black overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#111827",
            color: "#fff",
            border: "2px solid #000",
            boxShadow: "4px 4px 0px #000",
          },
        }}
      />

      {/* BACKGROUND DOTS */}
      <div
        className="absolute inset-0 z-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* HEADER */}
      <nav className="shrink-0 border-b-2 border-black px-6 py-4 bg-white z-50 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-black p-1.5 rounded-lg text-white shadow-[3px_3px_0px_#BEF264] border-2 border-black">
              <Zap size={20} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter italic">
              KAIZEN<span className="text-[#65A30D]">.AI</span>
            </h1>
          </div>
          <a
            href="https://github.com/StarDust130/kaizen_ai"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold text-xs uppercase tracking-widest cursor-pointer"
          >
            <Github size={16} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </nav>

      {/* 📱 MOBILE TABS */}
      <AnimatePresence>
        {hasStarted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="lg:hidden px-4 pt-4 shrink-0 z-20 relative"
          >
            <div className="flex bg-white p-1 rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
              <button
                onClick={() => setActiveTab("create")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${activeTab === "create" ? "bg-black text-white" : "text-gray-400 hover:text-black"}`}
              >
                <PenTool size={14} /> Create
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${activeTab === "preview" ? "bg-black text-white" : "text-gray-400 hover:text-black"}`}
              >
                <Eye size={14} /> Preview
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8 flex items-center justify-center relative z-10 h-full overflow-hidden">
        {/* CONTAINER GRID */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`
            w-full grid gap-6 h-full items-start transition-all duration-500
            ${hasStarted ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1 place-items-center"}
          `}
        >
          {/* 👈 LEFT: INPUT CARD */}
          <motion.div
            layout
            className={`
              bg-white border-2 border-black shadow-[6px_6px_0px_#000] rounded-2xl flex flex-col overflow-hidden
              ${activeTab === "create" ? "flex" : "hidden lg:flex"}
              ${hasStarted ? "lg:col-span-5 h-full" : "w-full max-w-xl h-auto max-h-[85vh]"} 
            `}
          >
            <div className="flex-1 flex flex-col p-6 gap-5 overflow-y-auto custom-scrollbar">
              {/* Header inside card */}
              <div className="flex justify-between items-center border-b-2 border-gray-100 pb-4 shrink-0">
                <div>
                  <h2 className="text-xl font-black italic tracking-tighter">
                    CREATE POST
                  </h2>
                  {!hasStarted && (
                    <p className="text-xs text-gray-500 font-bold mt-1">
                      Let's go viral today.
                    </p>
                  )}
                </div>
                <div className="w-3 h-3 rounded-full bg-[#BEF264] border-2 border-black" />
              </div>

              {/* Form Inputs */}
              <div className="space-y-1.5 shrink-0">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-600">
                  Target Audience
                </label>
                <input
                  placeholder="Ex: SaaS Founders, Developers..."
                  className="w-full bg-[#F9FAFB] border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:shadow-[4px_4px_0px_#BEF264] transition-all font-bold placeholder:text-gray-300 text-sm"
                  onChange={(e) =>
                    setFormData({ ...formData, audience: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col flex-1 space-y-1.5 min-h-[160px] relative group">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-600">
                  Topic / Core Idea
                </label>
                <div className="flex-1 relative bg-[#F9FAFB] border-2 border-gray-200 rounded-xl focus-within:border-black focus-within:shadow-[4px_4px_0px_#BEF264] transition-all flex flex-col">
                  <div className="absolute top-4 left-4 pointer-events-none whitespace-pre-wrap font-bold text-gray-300 z-0 text-sm leading-relaxed p-0.5">
                    <span className="opacity-0">{formData.topic}</span>
                    <span className="text-gray-400 opacity-50">
                      {suggestion}
                    </span>
                  </div>
                  <textarea
                    value={formData.topic}
                    onKeyDown={handleKeyDown}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className="flex-1 w-full bg-transparent p-4 outline-none relative z-10 resize-none font-bold text-[#111827] text-sm leading-relaxed placeholder:text-transparent"
                    placeholder="Start typing..."
                  />
                  {suggestion && (
                    <div className="absolute bottom-3 right-3 text-[9px] font-black text-white bg-black px-2 py-1 rounded animate-pulse">
                      TAB
                    </div>
                  )}
                </div>
              </div>

              {/* Selects */}
              <div className="shrink-0 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-gray-600">
                    Tone
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-white border-2 border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-black focus:shadow-[2px_2px_0px_#BEF264] font-bold text-xs appearance-none cursor-pointer"
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
                      size={14}
                      strokeWidth={3}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-gray-600">
                    Model
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-white border-2 border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-black focus:shadow-[2px_2px_0px_#BEF264] font-bold text-xs appearance-none cursor-pointer"
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
                      size={14}
                      strokeWidth={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* GENERATE BUTTON */}
            <div className="p-6 bg-white border-t-2 border-black shrink-0">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3.5 bg-black text-white border-2 border-black text-sm rounded-xl font-black uppercase tracking-wide shadow-[4px_4px_0px_#BEF264] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-[#222] active:translate-x-[4px] active:translate-y-[4px] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <RefreshCcw className="animate-spin" size={18} />
                ) : (
                  <>
                    <Sparkles
                      size={18}
                      className="text-[#BEF264] group-hover:animate-pulse"
                    />{" "}
                    GENERATE
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* 👉 RIGHT: PREVIEW CARD (Visible after Generate) */}
          <AnimatePresence>
            {hasStarted && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className={`
                  bg-white rounded-2xl border-2 border-black shadow-[6px_6px_0px_#000] flex-col overflow-hidden relative h-full
                  ${activeTab === "preview" ? "flex" : "hidden lg:flex"}
                  lg:col-span-7
                `}
              >
                {/* Toolbar */}
                <div className="shrink-0 px-6 py-4 border-b-2 border-black bg-gray-50 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-black italic tracking-tighter">
                        OUTPUT
                      </h2>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full border border-black ${loading ? "bg-yellow-400 animate-pulse" : "bg-[#BEF264]"}`}
                        />
                        {loading ? "Thinking..." : "Ready"}
                      </span>
                    </div>
                    {output && !loading && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(output);
                            toast.success("Copied!");
                          }}
                          className="p-2 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-black"
                        >
                          <Copy size={16} strokeWidth={3} />
                        </button>
                        <button
                          onClick={() =>
                            window.open(
                              `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(output)}`,
                              "_blank",
                            )
                          }
                          className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase bg-[#0077B5] text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                          <Linkedin size={16} strokeWidth={3} /> POST
                        </button>
                      </div>
                    )}
                  </div>

                  {output && !loading && (
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {["Shorten", "Refine", "Retry"].map((action) => (
                        <button
                          key={action}
                          onClick={() =>
                            handleEdit(action.toLowerCase() as any)
                          }
                          className="flex-1 py-1.5 px-4 bg-white border-2 border-black rounded-lg text-[10px] font-black uppercase text-black hover:bg-[#ecfccb] transition-all whitespace-nowrap shadow-[2px_2px_0px_#000] active:shadow-none active:translate-y-[1px]"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <div className="space-y-4 pt-8 opacity-50 max-w-xl mx-auto">
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
                        <div className="flex justify-center pt-6">
                          <span className="text-[10px] font-black bg-black text-white px-3 py-1 rounded-full animate-bounce">
                            COOKING...
                          </span>
                        </div>
                      </div>
                    ) : output ? (
                      <div className="prose prose-lg max-w-none">
                        <p className="whitespace-pre-wrap text-[#111827] text-[17px] leading-8 font-medium font-sans">
                          {streamedText}
                          <span className="inline-block w-2 h-5 bg-[#BEF264] border border-black ml-1 animate-pulse align-middle" />
                        </p>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40 gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-400">
                          <Send size={32} className="text-gray-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Waiting for input...
                        </p>
                      </div>
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
