export type PaymentLinkPayload = {
  /** Receiver address (the creator's Universal Account / EOA). */
  to: string;
  /** Amount in USDC, human readable string, e.g. "12.50". */
  amount: string;
  /** Optional note shown to the payer. */
  note?: string;
  /** Creation timestamp (ms). */
  ts: number;
};

const base64UrlEncode = (input: string) =>
  btoa(unescape(encodeURIComponent(input)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const base64UrlDecode = (input: string) => {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(padded)));
};

export const encodePaymentLink = (payload: PaymentLinkPayload): string =>
  base64UrlEncode(JSON.stringify(payload));

export const decodePaymentLink = (code: string): PaymentLinkPayload | null => {
  try {
    const parsed = JSON.parse(base64UrlDecode(code));
    if (
      typeof parsed.to === "string" &&
      /^0x[0-9a-fA-F]{40}$/.test(parsed.to) &&
      typeof parsed.amount === "string" &&
      Number(parsed.amount) > 0
    ) {
      return parsed as PaymentLinkPayload;
    }
    return null;
  } catch {
    return null;
  }
};

export type StoredLink = PaymentLinkPayload & { code: string };

export const buildStoredLink = (
  owner: string,
  amount: string,
  note?: string,
): StoredLink => {
  const payload: PaymentLinkPayload = { to: owner, amount, note, ts: Date.now() };
  return { ...payload, code: encodePaymentLink(payload) };
};

const STORAGE_KEY = "dogi:links";
const LEGACY_STORAGE_KEY = "paylink:links";

export const loadStoredLinks = (owner: string): StoredLink[] => {
  if (typeof window === "undefined") return [];
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (Array.isArray(all[owner.toLowerCase()])) return all[owner.toLowerCase()];
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) ?? "{}");
    return Array.isArray(legacy[owner.toLowerCase()]) ? legacy[owner.toLowerCase()] : [];
  } catch {
    return [];
  }
};

export const saveStoredLink = (owner: string, link: StoredLink) => {
  const all = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      return {};
    }
  })();
  const key = owner.toLowerCase();
  all[key] = [link, ...(Array.isArray(all[key]) ? all[key] : [])];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
};

export const deleteStoredLink = (owner: string, code: string) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    const key = owner.toLowerCase();
    all[key] = (all[key] ?? []).filter((l: StoredLink) => l.code !== code);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
};
