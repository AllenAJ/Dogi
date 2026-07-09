export type CreatorPagePayload = {
  /** Receiver address (the creator's Universal Account / EOA). */
  to: string;
  /** Display name, e.g. "Allen". */
  name: string;
  /** Short bio shown under the name. */
  bio?: string;
  /** Avatar emoji. */
  emoji?: string;
  /** Price of one treat in USD. */
  price: number;
  /** Creation timestamp (ms). */
  ts: number;
};

export const DOGI_AVATAR = "dogi";
export const TREAT_AVATAR = "treat";

export const CREATOR_EMOJIS = [DOGI_AVATAR, TREAT_AVATAR, "🎨", "🎸", "✍️", "📷", "🎮", "🧑‍🍳", "🌱"];

const base64UrlEncode = (input: string) =>
  btoa(unescape(encodeURIComponent(input)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const base64UrlDecode = (input: string) => {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(padded)));
};

export const encodeCreatorPage = (payload: CreatorPagePayload): string =>
  base64UrlEncode(JSON.stringify(payload));

export const decodeCreatorPage = (code: string): CreatorPagePayload | null => {
  try {
    const parsed = JSON.parse(base64UrlDecode(code));
    if (
      typeof parsed.to === "string" &&
      /^0x[0-9a-fA-F]{40}$/.test(parsed.to) &&
      typeof parsed.name === "string" &&
      parsed.name.trim().length > 0 &&
      parsed.name.length <= 40 &&
      typeof parsed.price === "number" &&
      parsed.price >= 0.5 &&
      parsed.price <= 1000
    ) {
      return parsed as CreatorPagePayload;
    }
    return null;
  } catch {
    return null;
  }
};

export type CreatorConfig = {
  name: string;
  bio: string;
  emoji: string;
  price: number;
};

const STORAGE_KEY = "dogi:creator";
const LEGACY_STORAGE_KEY = "paylink:creator";

export const loadCreatorConfig = (owner: string): CreatorConfig | null => {
  if (typeof window === "undefined") return null;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    let config = all[owner.toLowerCase()];
    if (!config) {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) ?? "{}");
      config = legacy[owner.toLowerCase()];
    }
    return config && typeof config.name === "string" ? (config as CreatorConfig) : null;
  } catch {
    return null;
  }
};

export const saveCreatorConfig = (owner: string, config: CreatorConfig) => {
  const all = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      return {};
    }
  })();
  all[owner.toLowerCase()] = config;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
};

export const creatorPageCode = (owner: string, config: CreatorConfig): string =>
  encodeCreatorPage({
    to: owner,
    name: config.name,
    bio: config.bio || undefined,
    emoji: config.emoji || undefined,
    price: config.price,
    ts: Date.now(),
  });
