"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import MobileTabs from "./components/MobileTabs";
import PostForm from "./components/PostForm";
import PostPreview from "./components/PostPreview";
import PostHistory from "./components/PostHistory";
import FloatingDecorations from "./components/FloatingDecorations";
import { usePostGenerator } from "./hooks/usePostGenerator";

export default function KaizenAI() {
  const {
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
  } = usePostGenerator();

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

      {/* Grain overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <FloatingDecorations />

      <Header
        historySlot={
          <PostHistory
            history={history}
            onLoad={loadFromHistory}
            onClear={clearHistory}
            onDelete={deleteHistoryItem}
          />
        }
      />

      {/* Mobile Tabs - only visible after first generation */}
      {hasStarted && (
        <div className="lg:hidden">
          <MobileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hasOutput={!!output}
            loading={loading}
          />
        </div>
      )}

      {/* Main content */}
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
          {/* Left: Form */}
          <PostForm
            formData={formData}
            onFormChange={setFormData}
            onGenerate={handleGenerate}
            loading={loading}
            hasStarted={hasStarted}
            activeTab={activeTab}
            suggestion={suggestion}
            onSuggestionAccept={handleSuggestionAccept}
          />

          {/* Right: Preview */}
          <AnimatePresence>
            {hasStarted && (
              <PostPreview
                output={output}
                streamedText={streamedText}
                loading={loading}
                activeTab={activeTab}
                onEdit={handleEdit}
                onCustomEdit={handleCustomEdit}
                onSkip={skipStreaming}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
