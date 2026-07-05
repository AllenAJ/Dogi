export const ARBITRUM_CHAIN_ID = 42161;

/** Native USDC on Arbitrum One — the settlement asset for all payment links. */
export const ARBITRUM_USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

export const ARBITRUM_RPC_URL =
  process.env.NEXT_PUBLIC_ARB_RPC_URL || "https://arb1.arbitrum.io/rpc";

export const MAGIC_API_KEY = process.env.NEXT_PUBLIC_MAGIC_API_KEY ?? "";

export const PARTICLE_PROJECT_ID =
  process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID ?? "";
export const PARTICLE_CLIENT_KEY =
  process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY ?? "";
export const PARTICLE_APP_ID = process.env.NEXT_PUBLIC_PARTICLE_APP_ID ?? "";

export const hasRequiredEnv =
  Boolean(MAGIC_API_KEY) &&
  Boolean(PARTICLE_PROJECT_ID) &&
  Boolean(PARTICLE_CLIENT_KEY) &&
  Boolean(PARTICLE_APP_ID);

export const explorerTxUrl = (transactionId: string) =>
  `https://universalx.app/activity/details?id=${transactionId}`;

export const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  56: "BNB Chain",
  101: "Solana",
  196: "X Layer",
  8453: "Base",
  42161: "Arbitrum",
};
