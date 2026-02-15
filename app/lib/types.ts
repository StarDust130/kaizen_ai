export interface FormData {
  topic: string;
  tone: string;
  audience: string;
  model: string;
  postLength: "short" | "medium" | "long";
  hookStyle: string;
}

export type ValidationStatus =
  | "safe"
  | "too_short"
  | "gibberish"
  | "irrelevant"
  | "off_topic"
  | "profanity";

export type EditAction =
  | "shorten"
  | "refine"
  | "retry"
  | "add_hashtags"
  | "add_emoji"
  | "add_cta"
  | "custom_selection";

export type TabKey = "create" | "preview";

export interface ToneOption {
  label: string;
  value: string;
  emoji: string;
}

export interface ModelOption {
  label: string;
  value: string;
  description: string;
  category: "popular" | "meta" | "open" | "experimental";
}

export interface ValidationError {
  title: string;
  message: string;
  icon: string;
  suggestions: string[];
}

export interface HistoryItem {
  id: string;
  topic: string;
  audience: string;
  tone: string;
  content: string;
  createdAt: number;
}
