export const shortAddress = (address: string, chars = 4) =>
  address.length > chars * 2 + 2
    ? `${address.slice(0, chars + 2)}…${address.slice(-chars)}`
    : address;

export const formatUsd = (value: number | string, maxFraction = 2) => {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: maxFraction,
  }).format(n);
};

export const formatTokenAmount = (value: number, maxFraction = 5) => {
  if (!Number.isFinite(value)) return "0";
  if (value !== 0 && Math.abs(value) < 0.00001) return "<0.00001";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxFraction,
  }).format(value);
};
