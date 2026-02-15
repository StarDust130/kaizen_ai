import type { ToneOption, ModelOption } from "./types";

export const TONES: ToneOption[] = [
  { label: "Professional", value: "Professional", emoji: "💼" },
  { label: "Storyteller", value: "Storyteller", emoji: "📖" },
  { label: "Contrarian", value: "Contrarian", emoji: "🔥" },
  { label: "Direct", value: "Direct", emoji: "🎯" },
  { label: "Super Chill", value: "Super Chill 🤙", emoji: "🤙" },
];

export const MODELS: ModelOption[] = [
  // Popular / Recommended
  {
    label: "⭐ Llama 3.3 70B",
    value: "llama-3.3-70b-versatile",
    description: "Most capable",
    category: "popular",
  },
  {
    label: "⚡ Llama 3.1 8B",
    value: "llama-3.1-8b-instant",
    description: "Ultra fast",
    category: "popular",
  },
  {
    label: "🌙 Kimi K2",
    value: "moonshotai/kimi-k2-instruct",
    description: "Moonshot AI flagship",
    category: "popular",
  },
  // Meta Llama family
  {
    label: "🦙 Llama 4 Maverick 17B",
    value: "meta-llama/llama-4-maverick-17b-128e-instruct",
    description: "Latest Llama 4",
    category: "meta",
  },
  {
    label: "🦙 Llama 4 Scout 17B",
    value: "meta-llama/llama-4-scout-17b-16e-instruct",
    description: "Llama 4 Scout",
    category: "meta",
  },
  // Open models
  {
    label: "🧠 GPT-OSS 120B",
    value: "openai/gpt-oss-120b",
    description: "OpenAI open-source 120B",
    category: "open",
  },
  {
    label: "🧠 GPT-OSS 20B",
    value: "openai/gpt-oss-20b",
    description: "OpenAI open-source 20B",
    category: "open",
  },
  {
    label: "🔮 Qwen3 32B",
    value: "qwen/qwen3-32b",
    description: "Alibaba Qwen3",
    category: "open",
  },
  // Experimental
  {
    label: "🌙 Kimi K2 0905",
    value: "moonshotai/kimi-k2-instruct-0905",
    description: "Kimi K2 updated",
    category: "experimental",
  },
  {
    label: "🌍 ALLaM 2 7B",
    value: "allam-2-7b",
    description: "Arabic-optimized",
    category: "experimental",
  },
];

export const EDIT_ACTIONS = [
  { label: "✂️ Shorten", action: "shorten" as const },
  { label: "✨ Refine", action: "refine" as const },
  { label: "🔄 Retry", action: "retry" as const },
  { label: "#️⃣ Hashtags", action: "add_hashtags" as const },
  { label: "😎 Add Emoji", action: "add_emoji" as const },
  { label: "📣 Add CTA", action: "add_cta" as const },
] as const;

export const TOPIC_MIN_LENGTH = 10;
export const TOPIC_MAX_LENGTH = 500;
export const AUDIENCE_MIN_LENGTH = 3;
export const AUDIENCE_MAX_LENGTH = 100;

export const TOPIC_TEMPLATES = [
  {
    label: "🚀 Career Growth",
    text: "How I grew from junior to senior developer in 2 years",
  },
  {
    label: "💡 Hot Take",
    text: "Unpopular opinion: remote work makes teams stronger",
  },
  {
    label: "📚 Lesson Learned",
    text: "The hardest lesson I learned after launching my startup",
  },
  {
    label: "🔧 Tech Insight",
    text: "Why every developer should learn system design in 2026",
  },
  {
    label: "🎯 Productivity",
    text: "The morning routine that doubled my output as a founder",
  },
  {
    label: "🤝 Leadership",
    text: "What I wish someone told me before becoming a team lead",
  },
];

export const HISTORY_KEY = "kaizen_post_history";

export const POST_LENGTHS = [
  {
    label: "🔥 Short",
    value: "short" as const,
    description: "3-5 lines, punchy",
  },
  {
    label: "📝 Medium",
    value: "medium" as const,
    description: "8-12 lines, balanced",
  },
  {
    label: "📖 Long",
    value: "long" as const,
    description: "15-20 lines, detailed",
  },
];

export const HOOK_STYLES = [
  { label: "🎣 Bold Statement", value: "bold_statement" },
  { label: "❓ Question", value: "question" },
  { label: "📊 Stat/Number", value: "statistic" },
  { label: "📖 Mini Story", value: "story" },
  { label: "🔥 Contrarian", value: "contrarian" },
  { label: "✨ Auto", value: "auto" },
];
