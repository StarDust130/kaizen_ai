"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function KaizenAI() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [formData, setFormData] = useState({
    topic: "",
    tone: "Professional",
    audience: "",
    model: "llama-3.3-70b-versatile",
  });

  // 🧠 Smart Autocomplete Logic
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

  // ⚡ Main Generation
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

  // 🛠️ AI Edit Tools
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
    <div className="min-h-screen bg-[#FDFCF8] text-[#1A2E22] font-sans selection:bg-[#4ADE80] selection:text-[#064E3B] flex flex-col font-medium">
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

      {/* HEADER */}
      <nav className="border-b-2 border-[#1A2E22]/10 px-8 py-6 bg-[#FDFCF8] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#1A2E22] p-2 rounded-lg text-white shadow-[4px_4px_0px_#4ADE80] border-2 border-[#1A2E22]">
              <Zap size={24} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-[#1A2E22]">
              KAIZEN<span className="text-[#15803d]">.AI</span>
            </h1>
          </div>
          <div className="hidden md:flex gap-4 text-xs font-bold uppercase tracking-widest">
            <span className="bg-[#4ADE80] px-4 py-2 rounded-lg border-2 border-[#1A2E22] shadow-[2px_2px_0px_#1A2E22]">
              Pro Mode
            </span>
            <span className="flex items-center gap-1 bg-white px-4 py-2 rounded-lg border-2 border-[#1A2E22] shadow-[2px_2px_0px_#1A2E22]">
              <Sparkles size={14} /> V3.0 Stable
            </span>
          </div>
        </div>
      </nav>

      {/* MAIN GRID */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        {/* LEFT: CONTROL CARD */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-[2rem] p-8 border-2 border-[#1A2E22] shadow-[8px_8px_0px_#1A2E22]"
        >
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-black text-[#1A2E22] mb-2 tracking-tight">
                Forge Your Voice.
              </h2>
              <p className="text-[#1A2E22]/60 font-semibold text-lg">
                Create high-impact LinkedIn content in seconds.
              </p>
            </div>

            {/* INPUTS */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-wider text-[#1A2E22]">
                  Target Audience
                </label>
                <input
                  placeholder="Ex: SaaS Founders, React Developers..."
                  className="w-full bg-[#F3F4F1] border-2 border-[#1A2E22] rounded-xl px-4 py-4 outline-none focus:bg-white focus:shadow-[4px_4px_0px_#4ADE80] transition-all font-bold placeholder:text-[#1A2E22]/30 text-lg"
                  onChange={(e) =>
                    setFormData({ ...formData, audience: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2 relative group">
                <label className="text-sm font-black uppercase tracking-wider text-[#1A2E22]">
                  Topic / Core Message
                </label>
                <div className="relative bg-[#F3F4F1] rounded-xl border-2 border-[#1A2E22] focus-within:bg-white focus-within:shadow-[4px_4px_0px_#4ADE80] transition-all">
                  <div className="absolute top-4 left-4 pointer-events-none whitespace-pre-wrap font-bold text-[#1A2E22]/30 z-0 text-lg">
                    <span className="opacity-0">{formData.topic}</span>
                    <span className="text-[#1A2E22]/40">{suggestion}</span>
                  </div>
                  <textarea
                    value={formData.topic}
                    onKeyDown={handleKeyDown}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className="w-full bg-transparent p-4 min-h-[180px] outline-none relative z-10 resize-none font-bold text-[#1A2E22] text-lg placeholder:text-transparent"
                    placeholder="What do you want to say?"
                  />
                  {suggestion && (
                    <div className="absolute bottom-3 right-3 text-[10px] font-black text-[#1A2E22] bg-[#4ADE80] border-2 border-[#1A2E22] px-2 py-1 rounded animate-pulse">
                      TAB TO COMPLETE
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-wider text-[#1A2E22]">
                    Tone
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-white border-2 border-[#1A2E22] rounded-xl px-4 py-3.5 outline-none focus:shadow-[4px_4px_0px_#4ADE80] font-bold cursor-pointer transition-all"
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
                      size={16}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-wider text-[#1A2E22]">
                    Model
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-white border-2 border-[#1A2E22] rounded-xl px-4 py-3.5 outline-none focus:shadow-[4px_4px_0px_#4ADE80] font-bold cursor-pointer transition-all"
                      onChange={(e) =>
                        setFormData({ ...formData, model: e.target.value })
                      }
                    >
                      <option value="llama-3.3-70b-versatile">
                        Llama 3.3 (Smart)
                      </option>
                      <option value="llama-3.1-8b-instant">
                        Llama 3.1 (Fast)
                      </option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A2E22] pointer-events-none stroke-[3px]"
                      size={16}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-[#1A2E22] text-white text-xl rounded-xl font-black uppercase tracking-wide border-2 border-[#1A2E22] shadow-[6px_6px_0px_#4ADE80] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#4ADE80] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <RefreshCcw className="animate-spin" />
                ) : (
                  <>
                    <Sparkles
                      size={22}
                      fill="#4ADE80"
                      className="text-[#4ADE80]"
                    />{" "}
                    GENERATE POST
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: PREVIEW CARD */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2rem] border-2 border-[#1A2E22] shadow-[8px_8px_0px_#1A2E22] min-h-[600px] flex flex-col overflow-hidden relative"
        >
          {/* Preview Header */}
          <div className="px-8 py-6 border-b-2 border-[#1A2E22]/10 flex justify-between items-center bg-[#FDFCF8]">
            <span className="text-xs font-black uppercase tracking-wider text-[#1A2E22] flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#4ADE80] border border-[#1A2E22] animate-pulse" />{" "}
              Live Preview
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  toast.success("Copied!");
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase bg-white border-2 border-[#1A2E22] rounded-lg shadow-[3px_3px_0px_#1A2E22] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-[#1A2E22]"
              >
                <Copy size={14} strokeWidth={3} /> COPY
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(output)}`,
                    "_blank",
                  )
                }
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase bg-[#0077B5] text-white border-2 border-[#1A2E22] rounded-lg shadow-[3px_3px_0px_#1A2E22] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
              >
                <Linkedin size={14} strokeWidth={3} /> POST
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-grow p-8 lg:p-12 bg-white relative">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="space-y-6 max-w-lg mx-auto pt-20 opacity-50">
                  <div className="h-6 bg-[#1A2E22]/10 rounded-full w-full animate-pulse" />
                  <div className="h-6 bg-[#1A2E22]/10 rounded-full w-5/6 animate-pulse" />
                  <div className="h-6 bg-[#1A2E22]/10 rounded-full w-4/6 animate-pulse" />
                  <div className="flex justify-center pt-8">
                    <span className="text-sm font-black text-[#1A2E22] animate-bounce tracking-widest uppercase">
                      AI IS WRITING...
                    </span>
                  </div>
                </div>
              ) : output ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-lg max-w-none"
                >
                  <p className="whitespace-pre-wrap text-[#1A2E22] text-xl leading-relaxed font-semibold">
                    {output}
                  </p>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
                  <div className="w-24 h-24 bg-[#F3F4F1] rounded-full flex items-center justify-center border-2 border-dashed border-[#1A2E22]">
                    <Send size={40} className="text-[#1A2E22] ml-1 mt-1" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-[#1A2E22]">
                    Ready to Create
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Editor Toolbar */}
          {output && !loading && (
            <div className="p-6 bg-[#FDFCF8] border-t-2 border-[#1A2E22]/10 grid grid-cols-3 gap-4">
              <button
                onClick={() => handleEdit("shorten")}
                className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-[#1A2E22] rounded-xl text-xs font-black uppercase text-[#1A2E22] shadow-[4px_4px_0px_#1A2E22] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
              >
                <Scissors size={16} strokeWidth={3} /> Shorter
              </button>
              <button
                onClick={() => handleEdit("refine")}
                className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-[#1A2E22] rounded-xl text-xs font-black uppercase text-[#1A2E22] shadow-[4px_4px_0px_#1A2E22] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
              >
                <Wand2 size={16} strokeWidth={3} /> Refine Tone
              </button>
              <button
                onClick={() => handleEdit("retry")}
                className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-[#1A2E22] rounded-xl text-xs font-black uppercase text-[#1A2E22] shadow-[4px_4px_0px_#1A2E22] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
              >
                <RefreshCcw size={16} strokeWidth={3} /> Retry
              </button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
