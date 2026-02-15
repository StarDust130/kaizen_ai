import type { ValidationStatus, ValidationError } from "./types";

// ── Gibberish detection ──────────────────────────────────────────────
function isGibberish(text: string): boolean {
  const input = text.toLowerCase().replace(/\s+/g, " ").trim();

  // Repeated characters: aaaaaa, jjjjjj
  if (/(.)\1{3,}/.test(input)) return true;

  // Very low unique char ratio (e.g. "jkjfdkfdfdf")
  const alpha = input.replace(/[^a-z]/g, "");
  if (alpha.length > 5) {
    const unique = new Set(alpha).size;
    if (unique < Math.min(4, alpha.length * 0.3)) return true;
  }

  // Consonant clusters — check per word (not across word boundaries)
  const consonantCluster = /[bcdfghjklmnpqrstvwxyz]{5,}/i;
  const words = input.split(/\s+/);
  const clusterWords = words.filter((w) => consonantCluster.test(w));
  if (clusterWords.length > 0) return true;

  // No vowels in a word ≥4 chars
  const longNoVowel = words.filter(
    (w) => w.length >= 4 && !/[aeiouy]/i.test(w),
  );
  if (longNoVowel.length > 0) return true;

  // Keyboard smash patterns
  const keyboardPatterns =
    /qwer|asdf|zxcv|wasd|jkl|fgh|uiop|hjkl|qaz|wsx|edc|rfv|tgb|yhn|ujm/i;
  if (keyboardPatterns.test(input.replace(/\s/g, ""))) return true;

  // Random-looking: mostly single-char words or very short avg word length
  if (words.length >= 3) {
    const avgLen = words.reduce((s, w) => s + w.length, 0) / words.length;
    if (avgLen < 2.2) return true;
  }

  return false;
}

// ── Profanity detection ──────────────────────────────────────────────
function hasProfanity(text: string): boolean {
  const input = text.toLowerCase();
  const profanity = [
    "fuck",
    "shit",
    "bitch",
    "asshole",
    "bastard",
    "dick",
    "pussy",
    "whore",
    "slut",
    "nigger",
    "faggot",
    "retard",
    "damn",
    "crap",
    "stfu",
    "wtf",
    "lmao",
    "bullshit",
    "dumbass",
    "motherfucker",
    "idiot",
  ];
  return profanity.some((w) => {
    // Match whole word or as prefix/suffix (catches "fucking", "shitty", etc.)
    const re = new RegExp(`\\b${w}`, "i");
    return re.test(input);
  });
}

// ── Prompt injection / security ──────────────────────────────────────
function isPromptInjection(text: string): boolean {
  const input = text.toLowerCase();
  const triggers = [
    "ignore previous",
    "ignore above",
    "system prompt",
    "jailbreak",
    "act as",
    "you are now",
    "pretend you",
    "bypass",
    "override",
    "write code",
    "console.log",
    "sql injection",
    "drop table",
    "rm -rf",
    "sudo",
    "malware",
    "virus",
    "exploit",
    "script>",
    "<script",
    "eval(",
    "exec(",
    "import os",
  ];
  return triggers.some((t) => input.includes(t));
}

// ── Off-topic detection (not LinkedIn-related) ───────────────────────
function isOffTopic(text: string): boolean {
  const input = text.toLowerCase().trim();

  // Direct question patterns that aren't LinkedIn content
  const questionPatterns = [
    /^what (is|are|was|were|does|do|did) /,
    /^how (to|do|does|did|can|could) (make|cook|bake|solve|fix|calculate)/,
    /^who (is|was|are|were) /,
    /^where (is|are|was|were|can|do) /,
    /^when (is|was|did|does|will) /,
    /^can you (tell|explain|help|write|code|solve|calculate)/,
    /^please (write|code|solve|calculate|explain|tell)/,
    /^(define|translate|convert|calculate|compute|solve) /,
  ];
  if (questionPatterns.some((p) => p.test(input))) {
    // But allow LinkedIn-friendly questions
    const linkedinExempt =
      /\b(career|job|work|startup|business|team|leader|developer|company|hire|fired|growth|revenue|customer|client|marketing|brand|product|skill|interview|salary|promotion|manager|ceo|founder|cto|freelanc|remote|office|tech|software|ai|data|design|ux|saas|b2b|linkedin|network|mentor|intern|build|launch|scale|grow|idea|strategy|industry|innovation)\b/i;
    if (!linkedinExempt.test(input)) return true;
  }

  // Non-professional topics
  const offTopicKeywords = [
    "recipe",
    "weather",
    "movie",
    "song",
    "lyrics",
    "anime",
    "manga",
    "game",
    "cheat code",
    "minecraft",
    "fortnite",
    "gta",
    "pokemon",
    "cricket score",
    "football score",
    "horoscope",
    "zodiac",
    "astrology",
    "boyfriend",
    "girlfriend",
    "dating",
    "tinder",
    "crush",
    "love letter",
    "homework",
    "exam answer",
    "momos",
    "pizza recipe",
    "biryani",
    "cake recipe",
    "tikka masala",
    "instagram caption",
    "tiktok",
    "snapchat",
    "meme",
    "joke tell",
    "tell me a joke",
    "story time",
    "fairy tale",
    "bedtime story",
    "rap song",
    "poem about love",
    "dear diary",
  ];
  if (offTopicKeywords.some((k) => input.includes(k))) return true;

  // Purely programming/code requests (not "how I used Python at work")
  const codePatterns = [
    /\b(python|javascript|java|c\+\+|ruby|golang|rust|php|html|css)\b.*\b(code|program|function|script|bug|error|syntax)\b/i,
    /\bwrite (a |me )?(code|script|program|function|class|api)\b/i,
    /\b(debug|compile|runtime|stack overflow|segfault|npm install)\b/i,
  ];
  if (codePatterns.some((p) => p.test(input))) return true;

  return false;
}

// ── Audience-specific validation ─────────────────────────────────────
function isValidAudience(text: string): boolean {
  const input = text.toLowerCase().trim();

  // Professional keywords — allow plurals/suffixes (no trailing \b)
  const audienceKeywords =
    /\b(developer|engineer|founder|ceo|cto|cfo|cmo|manager|director|lead|designer|marketer|analyst|consultant|recruiter|freelancer|entrepreneur|executive|professional|student|intern|hr|sales|product|project|coach|mentor|teacher|writer|creator|influencer|investor|partner|vp|head of|team|staff|people|community|audience|leader|architect|scientist|researcher|specialist|strategist|advisor|owner|operator|startup|saas|b2b|b2c|tech|software|ai|data|cloud|fintech|health|edtech|ecommerce|agency|enterprise|smb|small business|senior|junior|mid[- ]?level|entry[- ]?level|marketing|finance|accounting|legal|medical|nursing|pharma|biotech|crypto|web3|blockchain|mobile|frontend|backend|fullstack|full[- ]?stack|devops|sre|qa|tester|security|infosec|support|success|operations|logistics|supply chain|manufacturing|retail|hospitality|real estate|media|content|seo|growth|brand|vc|angel|pe|private equity|non[- ]?profit|ngo|government|public sector|education|academia|faculty)/i;
  if (audienceKeywords.test(input)) return true;

  // Allow broad descriptions
  if (
    /\b(people|anyone|those|professionals|leaders|teams|workers|employees|colleagues|individuals|beginners|experts|newcomers|veterans|aspirants|enthusiasts|practitioners|graduates|alumni|candidates|job seekers|hiring managers)\b/i.test(
      input,
    )
  )
    return true;

  // Allow "X who Y" or "X in Y" patterns
  if (
    /\w+\s+(who|in|at|from|working|looking|interested|building|running|managing|leading)\s+/i.test(
      input,
    )
  )
    return true;

  return false;
}

// ── Main validation function ─────────────────────────────────────────
export function validateField(text: string): ValidationStatus {
  const input = text.toLowerCase().trim();

  if (input.length < 3) return "too_short";
  if (isGibberish(input)) return "gibberish";
  if (hasProfanity(input)) return "profanity";
  if (isPromptInjection(input)) return "irrelevant";
  if (isOffTopic(input)) return "off_topic";

  return "safe";
}

// ── Audience-specific validator ──────────────────────────────────────
export function validateAudience(text: string): ValidationStatus {
  const input = text.toLowerCase().trim();

  if (input.length < 3) return "too_short";
  if (isGibberish(input)) return "gibberish";
  if (hasProfanity(input)) return "profanity";
  if (isPromptInjection(input)) return "irrelevant";

  // Must contain at least one professional-sounding term
  if (!isValidAudience(input)) return "off_topic";

  return "safe";
}

// ── Error messages ───────────────────────────────────────────────────
export function getValidationError(
  status: ValidationStatus,
  field: "topic" | "audience" = "topic",
): ValidationError {
  switch (status) {
    case "too_short":
      return {
        title: "Too Short!",
        message:
          field === "audience"
            ? "Your target audience needs more detail. Who exactly are you writing for?"
            : "Your topic needs more detail to generate a quality LinkedIn post.",
        icon: "📏",
        suggestions:
          field === "audience"
            ? [
                "Try: 'Software Developers & Engineers'",
                "Try: 'SaaS Founders & CTOs'",
                "Try: 'Marketing Professionals in Tech'",
              ]
            : [
                "Add more context about your topic",
                "Include specific details or experiences",
                "Mention what value you want to share",
              ],
      };
    case "gibberish":
      return {
        title: "That Doesn't Look Right 🤔",
        message:
          field === "audience"
            ? "This doesn't look like a real audience. Please enter a professional group or role."
            : "This doesn't look like a real topic. Please enter something meaningful.",
        icon: "🤔",
        suggestions:
          field === "audience"
            ? [
                "Try: 'Junior Developers'",
                "Try: 'Startup Founders'",
                "Try: 'Product Managers in SaaS'",
              ]
            : [
                "Try: 'Why remote work is the future of tech'",
                "Try: 'Lessons from scaling my startup to 100 users'",
                "Try: 'The one skill every developer needs'",
              ],
      };
    case "off_topic":
      return {
        title:
          field === "audience"
            ? "Not a Professional Audience"
            : "Not LinkedIn Material 🚧",
        message:
          field === "audience"
            ? "Your target audience should be a professional group, role, or industry. LinkedIn is for business networking!"
            : "This doesn't seem related to professional content. LinkedIn posts should be about business, career, tech, leadership, or professional growth.",
        icon: field === "audience" ? "👥" : "🚧",
        suggestions:
          field === "audience"
            ? [
                "Try a job title: 'Software Engineers'",
                "Try an industry: 'FinTech Professionals'",
                "Try a role: 'Team Leads & Engineering Managers'",
              ]
            : [
                "Share a professional insight or experience",
                "Discuss industry trends or hot takes",
                "Talk about career growth or lessons learned",
                "Share a success story or failure lesson",
              ],
      };
    case "irrelevant":
      return {
        title: "Security Alert 🛡️",
        message:
          "This looks like it might be trying to manipulate the AI. Let's stick to genuine LinkedIn content!",
        icon: "🛡️",
        suggestions: [
          "Share a real professional experience",
          "Discuss industry trends or opinions",
          "Talk about career growth or lessons learned",
        ],
      };
    case "profanity":
      return {
        title: "Keep It Professional 🛑",
        message:
          "LinkedIn is a professional network. Your post will reach recruiters, colleagues, and potential clients.",
        icon: "🛑",
        suggestions: [
          "Express frustration professionally: 'The challenge I faced...'",
          "Channel strong feelings into powerful insights",
          "Keep the energy — lose the language",
        ],
      };
    default:
      return {
        title: "Invalid Input",
        message: "Please enter a valid topic for your LinkedIn post.",
        icon: "⚠️",
        suggestions: ["Try entering a professional topic"],
      };
  }
}
