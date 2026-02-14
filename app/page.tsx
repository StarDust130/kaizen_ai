"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Copy,
  Send,
  Linkedin,
  Zap,
  Cpu,
  MousePointer2,
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 🧠 Inline Autocomplete Logic (Ghost Text)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Tab" || e.key === "ArrowRight") && suggestion) {
      e.preventDefault();
      setFormData({ ...formData, topic: formData.topic + suggestion });
      setSuggestion("");
    }
  };

  const handleInputChange = (val: string) => {
    setFormData({ ...formData, topic: val });
    // Simple logic: if user types "The future of", suggest "AI is here."
    if (val.toLowerCase().endsWith("future of ")) setSuggestion("AI is here.");
    else if (val.toLowerCase().endsWith("how to "))
      setSuggestion("scale faster.");
    else setSuggestion("");
  };

  const generatePost = async () => {
    if (!formData.topic) return toast.error("Energy required. Type a topic.");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setOutput(data.content);
      toast.success("Post Forged! 🔥");
    } catch (err) {
      toast.error("Forge Failure.");
    } finally {
      setLoading(false);
    }
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://kaizen.ai")}&summary=${encodeURIComponent(output)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-blue-500 selection:text-white pb-10">
      <Toaster position="top-center" />

      {/* 🌌 GLASS NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/60 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="bg-black p-2 rounded-lg">
              <Zap className="text-white" size={18} />
            </div>
            <span className="font-black text-xl tracking-tighter italic">
              KAIZEN.AI
            </span>
          </motion.div>
          <div className="hidden md:flex gap-6 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            <span className="flex items-center gap-1">
              <Cpu size={12} /> {formData.model}
            </span>
            <span className="text-blue-600">Stable V2.0</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-4">
        {/* 🛠️ EDITOR SIDE */}
        <div className="lg:col-span-5 space-y-8">
          <header className="space-y-2">
            <motion.h2
              layoutId="title"
              className="text-4xl lg:text-5xl font-black leading-tight tracking-tight"
            >
              Don't just post. <br />
              <span className="text-blue-600">Dominate.</span>
            </motion.h2>
            <p className="text-slate-500 font-medium text-sm">
              Elevate your LinkedIn presence with high-conversion AI.
            </p>
          </header>

          <div className="space-y-6">
            <div className="relative group">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1 tracking-widest">
                Core Message & Ideas
              </label>
              <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all p-4">
                {/* GHOST TEXT LAYER */}
                <div className="absolute top-4 left-4 text-slate-300 pointer-events-none whitespace-pre-wrap leading-relaxed">
                  <span className="opacity-0">{formData.topic}</span>
                  <span>{suggestion}</span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={formData.topic}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => handleInputChange(e.target.value)}
                  rows={6}
                  className="w-full bg-transparent outline-none relative z-10 text-slate-700 leading-relaxed resize-none"
                  placeholder="Start typing your vision..."
                />
                <div className="absolute bottom-3 right-3 opacity-40 text-[10px] font-bold">
                  TAB TO COMPLETE
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  Vibe
                </label>
                <select
                  onChange={(e) =>
                    setFormData({ ...formData, tone: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none cursor-pointer focus:border-blue-500 transition-all"
                >
                  <option>Professional</option>
                  <option>Hype</option>
                  <option>Stoic</option>
                  <option>Savage</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  Persona
                </label>
                <input
                  placeholder="e.g. CEO, Dev"
                  onChange={(e) =>
                    setFormData({ ...formData, audience: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={generatePost}
              disabled={loading}
              className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl shadow-black/20 flex items-center justify-center gap-3 disabled:bg-slate-300 transition-all"
            >
              {loading ? (
                "Forging..."
              ) : (
                <>
                  <MousePointer2 size={18} /> Forge Content
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* 📺 PREVIEW SIDE */}
        <div className="lg:col-span-7">
          <div className="sticky top-28 bg-white rounded-[2rem] border border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="w-3 h-3 rounded-full bg-slate-200" />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(output);
                    toast.success("Copied!");
                  }}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Copy size={16} className="text-slate-500" />
                </button>
                <button
                  onClick={shareToLinkedIn}
                  className="flex items-center gap-2 bg-[#0077b5] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:brightness-110 transition-all"
                >
                  <Linkedin size={14} /> POST
                </button>
              </div>
            </div>

            <div className="p-10 min-h-[450px]">
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="space-y-4">
                    {[80, 95, 70, 85].map((w, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="h-4 bg-slate-100 rounded-full origin-left"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                ) : output ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-slate-800 leading-relaxed font-medium whitespace-pre-wrap"
                  >
                    {output}
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 pt-20">
                    <Sparkles size={48} className="mb-4 opacity-20" />
                    <p className="font-bold text-xs uppercase tracking-[0.2em]">
                      Ready for input
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
