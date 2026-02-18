import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Sparkles,
  RefreshCcw,
  AlertCircle,
  Lightbulb,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import CharCounter from "./CharCounter";
import ValidationModal from "./ValidationModal";
import {
  validateField,
  validateAudience,
  getValidationError,
} from "../lib/validation";
import {
  TONES,
  MODELS,
  TOPIC_MIN_LENGTH,
  TOPIC_MAX_LENGTH,
  AUDIENCE_MIN_LENGTH,
  AUDIENCE_MAX_LENGTH,
  TOPIC_TEMPLATES,
  POST_LENGTHS,
  HOOK_STYLES,
} from "../lib/constants";
import type { FormData, TabKey, ValidationError } from "../lib/types";

interface PostFormProps {
  formData: FormData;
  onFormChange: (data: FormData) => void;
  onGenerate: () => void;
  loading: boolean;
  hasStarted: boolean;
  activeTab: TabKey;
  suggestion: string;
  onSuggestionAccept: () => void;
}

export default function PostForm({
  formData,
  onFormChange,
  onGenerate,
  loading,
  hasStarted,
  activeTab,
  suggestion,
  onSuggestionAccept,
}: PostFormProps) {
  const [validationError, setValidationError] =
    useState<ValidationError | null>(null);
  const audienceTouchedRef = useRef(false);
  const topicTouchedRef = useRef(false);
  const [audienceError, setAudienceError] = useState("");
  const [topicError, setTopicError] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [topicFocused, setTopicFocused] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const advancedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when advanced options opens so the card is visible
  useEffect(() => {
    if (showAdvanced && advancedRef.current) {
      // Wait for Framer Motion height animation (250ms) to finish before scrolling
      const timeout = setTimeout(() => {
        advancedRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 280);
      return () => clearTimeout(timeout);
    }
  }, [showAdvanced]);

  // Inline validation helpers using refs to avoid stale closure issues
  const runAudienceValidation = useCallback(
    (value: string, forceTouched?: boolean) => {
      const touched = forceTouched || audienceTouchedRef.current;
      if (!touched) return;
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        setAudienceError("Target audience is required");
      } else if (trimmed.length < AUDIENCE_MIN_LENGTH) {
        setAudienceError(`At least ${AUDIENCE_MIN_LENGTH} characters needed`);
      } else if (trimmed.length > AUDIENCE_MAX_LENGTH) {
        setAudienceError(`Maximum ${AUDIENCE_MAX_LENGTH} characters`);
      } else {
        const status = validateAudience(trimmed);
        if (status === "gibberish") {
          setAudienceError("This doesn't look like a real audience");
        } else if (status === "off_topic") {
          setAudienceError("Enter a professional role or industry");
        } else if (status === "profanity") {
          setAudienceError("Keep it professional");
        } else if (status !== "safe") {
          setAudienceError("Please enter a valid professional audience");
        } else {
          setAudienceError("");
        }
      }
    },
    [],
  );

  const runTopicValidation = useCallback(
    (value: string, forceTouched?: boolean) => {
      const touched = forceTouched || topicTouchedRef.current;
      if (!touched) return;
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        setTopicError("Topic is required");
      } else if (trimmed.length < TOPIC_MIN_LENGTH) {
        setTopicError(`At least ${TOPIC_MIN_LENGTH} characters needed`);
      } else if (trimmed.length > TOPIC_MAX_LENGTH) {
        setTopicError(`Maximum ${TOPIC_MAX_LENGTH} characters`);
      } else {
        const status = validateField(trimmed);
        if (status === "gibberish") {
          setTopicError("This doesn't look like a real topic");
        } else if (status === "off_topic") {
          setTopicError("Not LinkedIn content — try a professional topic");
        } else if (status === "profanity") {
          setTopicError("Keep it professional");
        } else if (status !== "safe") {
          setTopicError("Please enter a valid LinkedIn topic");
        } else {
          setTopicError("");
        }
      }
    },
    [],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Tab" || e.key === "ArrowRight") && suggestion) {
      e.preventDefault();
      onSuggestionAccept();
    }
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleGenerate();
    }
  };

  const applyTemplate = (text: string) => {
    onFormChange({ ...formData, topic: text });
    setShowTemplates(false);
    topicTouchedRef.current = true;
    runTopicValidation(text, true);
  };

  const handleGenerate = () => {
    // Mark both as touched
    audienceTouchedRef.current = true;
    topicTouchedRef.current = true;

    const audienceTrimmed = formData.audience.trim();
    const topicTrimmed = formData.topic.trim();

    // Run inline validation so errors show visually
    runAudienceValidation(audienceTrimmed, true);
    runTopicValidation(topicTrimmed, true);

    if (!audienceTrimmed) {
      toast.error("Who is this post for? Add a target audience.");
      return;
    }

    if (audienceTrimmed.length < AUDIENCE_MIN_LENGTH) {
      toast.error("Target audience is too short. Be more specific.");
      return;
    }

    const audienceStatus = validateAudience(audienceTrimmed);
    if (audienceStatus !== "safe") {
      setValidationError(getValidationError(audienceStatus, "audience"));
      return;
    }

    if (!topicTrimmed) {
      toast.error("Please enter a topic for your post.");
      return;
    }

    if (topicTrimmed.length < TOPIC_MIN_LENGTH) {
      toast.error(
        `Topic needs at least ${TOPIC_MIN_LENGTH} characters. Add more detail.`,
      );
      return;
    }

    if (topicTrimmed.length > TOPIC_MAX_LENGTH) {
      toast.error("Topic is too long. Keep it concise.");
      return;
    }

    const topicStatus = validateField(topicTrimmed);
    if (topicStatus !== "safe") {
      setValidationError(getValidationError(topicStatus, "topic"));
      return;
    }

    onGenerate();
  };

  return (
    <>
      <ValidationModal
        error={validationError}
        onClose={() => setValidationError(null)}
      />

      <motion.div
        layout
        className={`bg-white border-[3px] border-black shadow-[5px_5px_0px_#000] rounded-2xl flex flex-col overflow-hidden ${
          activeTab === "create" ? "flex" : "hidden lg:flex"
        } ${
          hasStarted
            ? "lg:col-span-5 h-full"
            : "w-full max-w-xl max-h-[calc(100dvh-6rem)]"
        }`}
      >
        <div
          ref={scrollAreaRef}
          className="flex-1 flex flex-col p-4 sm:p-5 gap-3 sm:gap-4 overflow-y-auto custom-scrollbar"
        >
          {/* Header */}
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

          {/* Audience Field */}
          <motion.div
            className="space-y-1.5 shrink-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Target Audience
              </label>
              {audienceError && (
                <motion.span
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] font-bold text-red-500 flex items-center gap-1"
                >
                  <AlertCircle size={10} />
                  {audienceError}
                </motion.span>
              )}
            </div>
            <input
              placeholder="Ex: SaaS Founders, Developers..."
              value={formData.audience}
              maxLength={AUDIENCE_MAX_LENGTH}
              className={`w-full bg-[#FAFAF9] border-[3px] rounded-xl px-4 py-3 outline-none transition-all font-bold placeholder:text-gray-300 text-sm ${
                audienceError
                  ? "border-red-300 focus:border-red-500 focus:shadow-[3px_3px_0px_#FCA5A5]"
                  : "border-gray-200 focus:border-black focus:shadow-[3px_3px_0px_#BEF264]"
              }`}
              onChange={(e) => {
                const val = e.target.value;
                onFormChange({ ...formData, audience: val });
                runAudienceValidation(val);
              }}
              onBlur={() => {
                audienceTouchedRef.current = true;
                runAudienceValidation(formData.audience, true);
              }}
            />
          </motion.div>

          {/* Topic Field */}
          <motion.div
            className="flex flex-col flex-1 space-y-1.5 min-h-40 relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Topic / Core Idea
              </label>
              <div className="flex items-center gap-2">
                {topicError && (
                  <motion.span
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] font-bold text-red-500 flex items-center gap-1"
                  >
                    <AlertCircle size={10} />
                    {topicError}
                  </motion.span>
                )}
                <CharCounter current={formData.topic.length} />
              </div>
            </div>
            <div
              className={`flex-1 relative bg-[#FAFAF9] border-[3px] rounded-xl transition-all flex flex-col ${
                topicError
                  ? "border-red-300 focus-within:border-red-500 focus-within:shadow-[3px_3px_0px_#FCA5A5]"
                  : "border-gray-200 focus-within:border-black focus-within:shadow-[3px_3px_0px_#BEF264]"
              }`}
            >
              {/* Ghost suggestion overlay — only when focused */}
              {topicFocused && suggestion && (
                <div className="absolute top-0 left-0 p-4 pointer-events-none whitespace-pre-wrap font-bold text-gray-800 z-0 text-sm leading-relaxed">
                  <span className="opacity-0">{formData.topic}</span>
                  <span className="text-gray-400/50">{suggestion}</span>
                </div>
              )}
              <textarea
                value={formData.topic}
                onKeyDown={handleKeyDown}
                maxLength={TOPIC_MAX_LENGTH}
                onChange={(e) => {
                  const val = e.target.value;
                  onFormChange({ ...formData, topic: val });
                  runTopicValidation(val);
                }}
                onFocus={() => setTopicFocused(true)}
                onBlur={() => {
                  setTopicFocused(false);
                  topicTouchedRef.current = true;
                  runTopicValidation(formData.topic, true);
                }}
                className="flex-1 w-full bg-transparent p-4 outline-none relative z-10 resize-none font-bold text-[#111827] text-sm leading-relaxed placeholder:text-gray-300"
                placeholder="Start typing your idea..."
              />
              {/* Suggestion hints — only when focused */}
              <AnimatePresence>
                {topicFocused && suggestion && (
                  <>
                    {/* Desktop: Tab hint */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 5 }}
                      className="hidden sm:block absolute bottom-3 right-3 text-[9px] font-black text-black bg-[#BEF264] px-2.5 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]"
                    >
                      TAB ↹
                    </motion.div>
                    {/* Mobile: Tap button - uses onPointerDown to prevent blur stealing the event */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 5 }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSuggestionAccept();
                      }}
                      className="sm:hidden absolute bottom-3 right-3 text-[9px] font-black text-black bg-[#BEF264] px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 z-20"
                    >
                      TAP TO ACCEPT ✨
                    </motion.button>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Topic Templates - Quick start suggestions */}
          {!hasStarted && (
            <motion.div
              className="shrink-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <button
                type="button"
                onClick={() => setShowTemplates((s) => !s)}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
              >
                <Lightbulb size={11} strokeWidth={3} />
                {showTemplates
                  ? "Hide Templates"
                  : "Need ideas? Try a template"}
              </button>
              <AnimatePresence>
                {showTemplates && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      {TOPIC_TEMPLATES.map((template) => (
                        <motion.button
                          key={template.label}
                          type="button"
                          onClick={() => applyTemplate(template.text)}
                          className="text-left px-2.5 py-2 bg-[#FAFAF9] border-2 border-gray-200 rounded-lg hover:border-black hover:shadow-[2px_2px_0px_#BEF264] transition-all text-[10px] font-bold text-gray-600 leading-snug"
                          whileTap={{ scale: 0.97 }}
                        >
                          <span className="block text-xs mb-0.5">
                            {template.label}
                          </span>
                          <span className="text-gray-400 line-clamp-1">
                            {template.text}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Tone */}
          <motion.div
            className="shrink-0 space-y-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Tone
            </label>
            <div className="relative">
              <select
                value={formData.tone}
                className="w-full bg-white border-[3px] border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-black focus:shadow-[2px_2px_0px_#BEF264] font-bold text-xs appearance-none cursor-pointer"
                onChange={(e) =>
                  onFormChange({ ...formData, tone: e.target.value })
                }
              >
                {TONES.map((tone) => (
                  <option key={tone.value} value={tone.value}>
                    {tone.emoji} {tone.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={13}
                strokeWidth={3}
              />
            </div>
          </motion.div>

          {/* Advanced Options Toggle */}
          <motion.div
            ref={advancedRef}
            className="shrink-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              className="flex items-center gap-2 w-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors py-1"
            >
              <SlidersHorizontal size={12} strokeWidth={3} />
              <span>Advanced Options</span>
              <motion.div
                animate={{ rotate: showAdvanced ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={12} strokeWidth={3} />
              </motion.div>
              {!showAdvanced && (
                <span className="text-[9px] font-bold text-gray-800 normal-case tracking-normal ml-auto">
                  Hook · Length · Model
                </span>
              )}
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 pt-2">
                    {/* Hook Style */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Hook Style
                      </label>
                      <div className="relative">
                        <select
                          value={formData.hookStyle}
                          className="w-full bg-white border-[3px] border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-black focus:shadow-[2px_2px_0px_#BEF264] font-bold text-xs appearance-none cursor-pointer"
                          onChange={(e) =>
                            onFormChange({
                              ...formData,
                              hookStyle: e.target.value,
                            })
                          }
                        >
                          {HOOK_STYLES.map((hook) => (
                            <option key={hook.value} value={hook.value}>
                              {hook.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          size={13}
                          strokeWidth={3}
                        />
                      </div>
                    </div>

                    {/* Post Length pills */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Post Length
                      </label>
                      <div className="flex gap-2">
                        {POST_LENGTHS.map((len) => (
                          <button
                            key={len.value}
                            type="button"
                            onClick={() =>
                              onFormChange({
                                ...formData,
                                postLength: len.value,
                              })
                            }
                            className={`flex-1 py-2 px-2 rounded-lg border-[3px] text-[10px] font-black uppercase tracking-wider transition-all ${
                              formData.postLength === len.value
                                ? "bg-black text-[#BEF264] border-black shadow-[2px_2px_0px_#84CC16]"
                                : "bg-white text-gray-500 border-gray-200 hover:border-black"
                            }`}
                          >
                            {len.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Model */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        AI Model
                      </label>
                      <div className="relative">
                        <select
                          value={formData.model}
                          className="w-full bg-white border-[3px] border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-black focus:shadow-[2px_2px_0px_#BEF264] font-bold text-xs appearance-none cursor-pointer"
                          onChange={(e) =>
                            onFormChange({
                              ...formData,
                              model: e.target.value,
                            })
                          }
                        >
                          <optgroup label="⭐ Popular">
                            {MODELS.filter((m) => m.category === "popular").map(
                              (model) => (
                                <option key={model.value} value={model.value}>
                                  {model.label} — {model.description}
                                </option>
                              ),
                            )}
                          </optgroup>
                          <optgroup label="🦙 Meta Llama">
                            {MODELS.filter((m) => m.category === "meta").map(
                              (model) => (
                                <option key={model.value} value={model.value}>
                                  {model.label} — {model.description}
                                </option>
                              ),
                            )}
                          </optgroup>
                          <optgroup label="🧠 Open Models">
                            {MODELS.filter((m) => m.category === "open").map(
                              (model) => (
                                <option key={model.value} value={model.value}>
                                  {model.label} — {model.description}
                                </option>
                              ),
                            )}
                          </optgroup>
                          <optgroup label="🧪 Experimental">
                            {MODELS.filter(
                              (m) => m.category === "experimental",
                            ).map((model) => (
                              <option key={model.value} value={model.value}>
                                {model.label} — {model.description}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                        <ChevronDown
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          size={13}
                          strokeWidth={3}
                        />
                      </div>
                    </div>

                    {/* Quick Tip */}
                    <div className="p-3 hidden md:flex bg-linear-to-r from-[#F7FEE7] to-[#FEF9C3] rounded-xl border-2 border-dashed border-[#BEF264]">
                      <p className="text-[10px] font-bold text-gray-500 leading-relaxed">
                        💡{" "}
                        <span className="font-black text-gray-700">
                          Pro tip:
                        </span>{" "}
                        Be specific with your topic. Instead of &quot;AI&quot;,
                        try &quot;How AI helped me 3x my productivity as a solo
                        developer&quot;.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Generate Button */}
        <div className="p-4 sm:p-5 bg-white border-t-[3px] border-black shrink-0">
          <motion.button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3.5 bg-black text-[#BEF264] border-[3px] border-black text-sm rounded-xl font-black uppercase tracking-wider shadow-[4px_4px_0px_#84CC16] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
            whileHover={
              !loading ? { x: 2, y: 2, boxShadow: "0px 0px 0px #84CC16" } : {}
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
                GENERATE POST
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
