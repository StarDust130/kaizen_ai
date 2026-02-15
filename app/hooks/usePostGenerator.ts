"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { validateField } from "../lib/validation";
import { HISTORY_KEY } from "../lib/constants";
import type { FormData, TabKey, EditAction, HistoryItem } from "../lib/types";

export function usePostGenerator() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [streamedText, setStreamedText] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [formData, setFormData] = useState<FormData>({
    topic: "",
    tone: "Professional",
    audience: "",
    model: "llama-3.3-70b-versatile",
    postLength: "medium",
    hookStyle: "auto",
  });
  const [hasStarted, setHasStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("create");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  // Streamed text effect — word-by-word for cooler animation
  useEffect(() => {
    if (output && !loading) {
      const tokens = output.split(/(\s+)/); // preserves whitespace
      let i = 0;
      setStreamedText("");
      const interval = setInterval(() => {
        i++;
        setStreamedText(tokens.slice(0, i).join(""));
        if (i >= tokens.length) clearInterval(interval);
      }, 15);
      streamIntervalRef.current = interval;
      return () => {
        clearInterval(interval);
        streamIntervalRef.current = null;
      };
    } else if (loading) {
      setStreamedText("");
    }
  }, [output, loading]);

  const skipStreaming = useCallback(() => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    if (output) setStreamedText(output);
  }, [output]);

  // Autocomplete suggestions
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
          // silent fail
        }
      } else {
        setSuggestion("");
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [formData.topic]);

  const handleSuggestionAccept = useCallback(() => {
    if (suggestion) {
      setFormData((prev) => ({ ...prev, topic: prev.topic + suggestion }));
      setSuggestion("");
    }
  }, [suggestion]);

  const saveToHistory = useCallback(
    (content: string) => {
      const item: HistoryItem = {
        id: Date.now().toString(),
        topic: formData.topic,
        audience: formData.audience,
        tone: formData.tone,
        content,
        createdAt: Date.now(),
      };
      setHistory((prev) => {
        const updated = [item, ...prev].slice(0, 10); // keep last 10
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        } catch {
          // storage full - ignore
        }
        return updated;
      });
    },
    [formData.topic, formData.audience, formData.tone],
  );

  const handleGenerate = useCallback(async () => {
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
      saveToHistory(data.content);
      toast.success("Post generated!");
    } catch {
      toast.error("Generation failed. Try again.");
      setActiveTab("create");
    } finally {
      setLoading(false);
    }
  }, [formData, saveToHistory]);

  const handleEdit = useCallback(
    async (action: EditAction) => {
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
        saveToHistory(data.content);
        toast.success("Updated!", { id: toastId });
      } catch {
        toast.error("Failed to update", { id: toastId });
      } finally {
        setLoading(false);
      }
    },
    [output, formData.topic, saveToHistory],
  );

  const handleCustomEdit = useCallback(
    async (selectedText: string, instruction: string) => {
      if (!output || !selectedText || !instruction) return;
      setLoading(true);
      const toastId = toast.loading("Editing selection...");
      try {
        const res = await fetch("/api/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentText: output,
            action: "custom_selection",
            topic: formData.topic,
            selectedText,
            instruction,
          }),
        });
        const data = await res.json();
        // Replace ONLY the selected text with the AI's replacement
        const replacement = (data.content || "").trim();
        const updatedText = output.replace(selectedText, replacement);
        setOutput(updatedText);
        saveToHistory(updatedText);
        toast.success("Selection updated!", { id: toastId });
      } catch {
        toast.error("Failed to edit selection", { id: toastId });
      } finally {
        setLoading(false);
      }
    },
    [output, formData.topic, saveToHistory],
  );

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setOutput(item.content);
    setFormData((prev) => ({
      ...prev,
      topic: item.topic,
      audience: item.audience,
      tone: item.tone,
    }));
    setHasStarted(true);
    toast.success("Loaded from history!");
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // ignore
    }
    toast.success("History cleared!");
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    toast.success("Removed from history");
  }, []);

  return {
    loading,
    output,
    streamedText,
    suggestion,
    formData,
    setFormData,
    hasStarted,
    activeTab,
    setActiveTab,
    history,
    handleSuggestionAccept,
    handleGenerate,
    handleEdit,
    handleCustomEdit,
    loadFromHistory,
    clearHistory,
    deleteHistoryItem,
    skipStreaming,
  };
}
