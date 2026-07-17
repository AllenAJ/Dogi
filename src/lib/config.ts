const DEFAULT_MAINNET_CHAIN_ID = 42161;
const DEFAULT_TESTNET_CHAIN_ID = 421614;
const DEFAULT_MAINNET_USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

const settlementChainId = Number.parseInt(
  process.env.NEXT_PUBLIC_SETTLEMENT_CHAIN_ID ?? `${DEFAULT_MAINNET_CHAIN_ID}`,
  10,
);

/** Settlement chain for outgoing payments. Set NEXT_PUBLIC_SETTLEMENT_CHAIN_ID=421614 for Arbitrum Sepolia. */
export const ARBITRUM_CHAIN_ID = Number.isFinite(settlementChainId)
  ? settlementChainId
  : DEFAULT_MAINNET_CHAIN_ID;

/** Settlement token (USDC) on the selected settlement chain. */
export const ARBITRUM_USDC_ADDRESS =
  process.env.NEXT_PUBLIC_SETTLEMENT_USDC_ADDRESS ?? DEFAULT_MAINNET_USDC;

const defaultRpcByChain: Record<number, string> = {
  [DEFAULT_MAINNET_CHAIN_ID]: "https://arb1.arbitrum.io/rpc",
  [DEFAULT_TESTNET_CHAIN_ID]: "https://sepolia-rollup.arbitrum.io/rpc",
};

export const ARBITRUM_RPC_URL =
  process.env.NEXT_PUBLIC_ARB_RPC_URL ||
  defaultRpcByChain[ARBITRUM_CHAIN_ID] ||
  defaultRpcByChain[DEFAULT_MAINNET_CHAIN_ID];

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

/** Block-explorer link for a transaction hash on the settlement chain. */
export const settlementExplorerTxUrl = (txHash: string) =>
  IS_TESTNET_SETTLEMENT
    ? `https://sepolia.arbiscan.io/tx/${txHash}`
    : `https://arbiscan.io/tx/${txHash}`;

export const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  56: "BNB Chain",
  101: "Solana",
  196: "X Layer",
  8453: "Base",
  42161: "Arbitrum",
  421614: "Arbitrum Sepolia",
};

export const SETTLEMENT_CHAIN_LABEL =
  CHAIN_NAMES[ARBITRUM_CHAIN_ID] ?? `chain ${ARBITRUM_CHAIN_ID}`;

export const IS_TESTNET_SETTLEMENT = ARBITRUM_CHAIN_ID === DEFAULT_TESTNET_CHAIN_ID;
