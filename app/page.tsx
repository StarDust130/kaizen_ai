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
  Check,
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

  // 🧠 1. Typewriter Animation Logic
  useEffect(() => {
    if (output && !loading) {
      let i = 0;
      setStreamedText("");
      const interval = setInterval(() => {
        setStreamedText((prev) => output.slice(0, i + 1));
        i++;
        if (i >= output.length) clearInterval(interval);
      }, 5); // Speed of typing
      return () => clearInterval(interval);
    } else if (loading) {
      setStreamedText("");
    }
  }, [output, loading]);

  // 🧠 2. Smart Autocomplete
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.topic.length > 8 && !formData.topic.endsWith(" ")) {
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
    if (!formData.topic) return toast.error("Please enter a topic first.");
    setLoading(true);
    setSuggestion("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setOutput(data.content);
      toast.success("Content Generated!");
    } catch (err) {
      toast.error("Generation Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (action: "shorten" | "refine" | "retry") => {
    if (!output) return;
    setLoading(true);
    const toastId = toast.loading("AI is working...");
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
      toast.error("Edit Failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🟢 LAYOUT FIX: h-screen + overflow-hidden prevents body scroll
    <div className="h-screen bg-[#FDFCF8] text-[#1A2E22] font-sans selection:bg-[#4ADE80] selection:text-[#064E3B] flex flex-col font-medium overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1A2E22",
            color: "#fff",
            border: "2px solid #000",
          },
        }}
      />

      {/* HEADER (Fixed) */}
      <nav className="shrink-0 border-b-2 border-[#1A2E22]/10 px-6 py-4 bg-[#FDFCF8] z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#1A2E22] p-2 rounded-lg text-white shadow-[3px_3px_0px_#4ADE80] border-2 border-[#1A2E22]">
              <Zap size={20} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-[#1A2E22]">
              KAIZEN<span className="text-[#15803d]">.AI</span>
            </h1>
          </div>
          <div className="flex gap-3 text-[10px] font-black uppercase tracking-widest">
            <a
              href="https://github.com/StarDust130/kaizen_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-[#1A2E22] text-white rounded-lg border-2 border-[#1A2E22] shadow-[2px_2px_0px_#4ADE80] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT (Split View) */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 overflow-hidden">
        {/* 👈 LEFT: CONTROL CARD (Scrollable if needed, but fixed container) */}
        <div className="h-full bg-white rounded-[2rem] border-2 border-[#1A2E22] shadow-[6px_6px_0px_#1A2E22] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <div>
              <h2 className="text-lg font-black text-[#1A2E22] tracking-tight">
                Create LinkedIn Posts ✌️
              </h2>
            </div>

            {/* INPUTS */}
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-[#1A2E22]">
                  Target Audience
                </label>
                <input
                  placeholder="Ex: SaaS Founders..."
                  className="w-full bg-[#F3F4F1] border-2 border-[#1A2E22] rounded-xl px-4 py-3 outline-none focus:bg-white focus:shadow-[4px_4px_0px_#4ADE80] transition-all font-bold placeholder:text-[#1A2E22]/30"
                  onChange={(e) =>
                    setFormData({ ...formData, audience: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2 relative group flex-1">
                <label className="text-xs font-black uppercase tracking-wider text-[#1A2E22]">
                  Topic / Core Message
                </label>
                <div className="relative bg-[#F3F4F1] rounded-xl border-2 border-[#1A2E22] focus-within:bg-white focus-within:shadow-[4px_4px_0px_#4ADE80] transition-all min-h-[200px]">
                  <div className="absolute top-4 left-4 pointer-events-none whitespace-pre-wrap font-bold text-[#1A2E22]/30 z-0 text-base leading-relaxed">
                    <span className="opacity-0">{formData.topic}</span>
                    <span className="text-[#1A2E22]/40">{suggestion}</span>
                  </div>
                  <textarea
                    value={formData.topic}
                    onKeyDown={handleKeyDown}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className="w-full h-full bg-transparent p-4 outline-none relative z-10 resize-none font-bold text-[#1A2E22] text-base leading-relaxed placeholder:text-transparent"
                    placeholder="Start typing..."
                  />
                  {suggestion && (
                    <div className="absolute bottom-3 right-3 text-[9px] font-black text-[#1A2E22] bg-[#4ADE80] border-2 border-[#1A2E22] px-2 py-1 rounded animate-pulse">
                      TAB
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-[#1A2E22]">
                    Tone
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-white border-2 border-[#1A2E22] rounded-xl px-4 py-3 outline-none focus:shadow-[4px_4px_0px_#4ADE80] font-bold cursor-pointer transition-all text-sm"
                      onChange={(e) =>
                        setFormData({ ...formData, tone: e.target.value })
                      }
                    >
                      <option>Professional</option>
                      <option>Storyteller</option>
                      <option>Contrarian</option>
                      <option>Direct</option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A2E22] pointer-events-none stroke-[3px]"
                      size={14}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-[#1A2E22]">
                    Model
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-white border-2 border-[#1A2E22] rounded-xl px-4 py-3 outline-none focus:shadow-[4px_4px_0px_#4ADE80] font-bold cursor-pointer transition-all text-sm"
                      onChange={(e) =>
                        setFormData({ ...formData, model: e.target.value })
                      }
                    >
                      <option value="llama-3.3-70b-versatile">Llama 3.3</option>
                      <option value="llama-3.1-8b-instant">Llama 3.1</option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A2E22] pointer-events-none stroke-[3px]"
                      size={14}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GENERATE BUTTON (Sticky Footer in Left Card) */}
          <div className="p-6 pt-2 bg-white border-t-2 border-[#1A2E22]/5">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 bg-[#1A2E22] text-white text-lg rounded-xl font-black uppercase tracking-wide border-2 border-[#1A2E22] shadow-[4px_4px_0px_#4ADE80] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#4ADE80] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <RefreshCcw className="animate-spin" />
              ) : (
                <>
                  <Sparkles
                    size={18}
                    fill="#4ADE80"
                    className="text-[#4ADE80]"
                  />{" "}
                  GENERATE
                </>
              )}
            </button>
          </div>
        </div>

        {/* 👉 RIGHT: PREVIEW CARD (Independent Scroll) */}
        <div className="h-full bg-white rounded-[2rem] border-2 border-[#1A2E22] shadow-[6px_6px_0px_#1A2E22] flex flex-col overflow-hidden relative">
          {/* 🟢 TOP TOOLBAR (Sticky) */}
          <div className="shrink-0 px-6 py-4 border-b-2 border-[#1A2E22]/10 bg-[#FDFCF8] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1A2E22] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#4ADE80] border border-[#1A2E22] animate-pulse" />{" "}
                Preview
              </span>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(output);
                    toast.success("Copied!");
                  }}
                  className="p-2 bg-white border-2 border-[#1A2E22] rounded-lg shadow-[2px_2px_0px_#1A2E22] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-[#1A2E22]"
                >
                  <Copy size={14} strokeWidth={3} />
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(output)}`,
                      "_blank",
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase bg-[#0077B5] text-white border-2 border-[#1A2E22] rounded-lg shadow-[2px_2px_0px_#1A2E22] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  <Linkedin size={14} strokeWidth={3} /> POST
                </button>
              </div>
            </div>

            {/* EDIT TOOLS (Now at Top) */}
            {output && !loading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2"
              >
                <button
                  onClick={() => handleEdit("shorten")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border-2 border-[#1A2E22] rounded-lg text-[10px] font-black uppercase text-[#1A2E22] hover:bg-[#F3F4F1] transition-all"
                >
                  <Scissors size={12} strokeWidth={3} /> Shorten
                </button>
                <button
                  onClick={() => handleEdit("refine")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border-2 border-[#1A2E22] rounded-lg text-[10px] font-black uppercase text-[#1A2E22] hover:bg-[#F3F4F1] transition-all"
                >
                  <Wand2 size={12} strokeWidth={3} /> Refine
                </button>
                <button
                  onClick={() => handleEdit("retry")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border-2 border-[#1A2E22] rounded-lg text-[10px] font-black uppercase text-[#1A2E22] hover:bg-[#F3F4F1] transition-all"
                >
                  <RefreshCcw size={12} strokeWidth={3} /> Retry
                </button>
              </motion.div>
            )}
          </div>

          {/* SCROLLABLE CANVAS */}
          <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="space-y-4 max-w-lg mx-auto pt-10 opacity-50">
                  <div className="h-4 bg-[#1A2E22]/10 rounded-full w-full animate-pulse" />
                  <div className="h-4 bg-[#1A2E22]/10 rounded-full w-5/6 animate-pulse" />
                  <div className="h-4 bg-[#1A2E22]/10 rounded-full w-4/6 animate-pulse" />
                  <div className="flex justify-center pt-4">
                    <span className="text-xs font-black text-[#1A2E22] animate-bounce tracking-widest uppercase">
                      AI IS THINKING...
                    </span>
                  </div>
                </div>
              ) : output ? (
                <div className="prose prose-lg max-w-none">
                  <p className="whitespace-pre-wrap text-[#1A2E22] text-lg leading-loose font-semibold">
                    {streamedText}
                    <span className="inline-block w-2 h-5 bg-[#4ADE80] ml-1 animate-pulse align-middle" />
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
                  <div className="w-20 h-20 bg-[#F3F4F1] rounded-full flex items-center justify-center border-2 border-dashed border-[#1A2E22]">
                    <Send size={32} className="text-[#1A2E22] ml-1 mt-1" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#1A2E22]">
                    Ready to Create
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
