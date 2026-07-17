// The UA SDK ships declarations at dist/index.d.ts, but its package.json
// "exports" map has no "types" condition, so TypeScript cannot resolve them.
// (Mapping the package in tsconfig "paths" is not an option: Turbopack applies
// those mappings at runtime and would import the .d.ts, breaking the app.)
// This file mirrors the subset of the SDK's real type surface that we use.
declare module "@particle-network/universal-account-sdk" {
  export enum CHAIN_ID {
    SOLANA_MAINNET = 101,
    ETHEREUM_MAINNET = 1,
    BSC_MAINNET = 56,
    BASE_MAINNET = 8453,
    XLAYER_MAINNET = 196,
    ARBITRUM_MAINNET_ONE = 42161,
  }

  export enum SUPPORTED_TOKEN_TYPE {
    ETH = "eth",
    USDT = "usdt",
    USDC = "usdc",
    BNB = "bnb",
    SOL = "sol",
  }

  export const UNIVERSAL_ACCOUNT_VERSION: string;

  export interface IBasicToken {
    chainId: number;
    address: string;
  }

  export interface IToken {
    assetId?: string;
    type?: SUPPORTED_TOKEN_TYPE;
    chainId: number;
    address: string;
    decimals: number;
    realDecimals: number;
    name?: string;
    symbol?: string;
    image?: string;
    price?: number;
  }

  export interface IChainAggregation {
    token: IToken;
    amount: number;
    amountInUSD: number;
    rawAmount: number;
  }

  export interface IAsset {
    tokenType: SUPPORTED_TOKEN_TYPE;
    price: number;
    amount: number;
    amountInUSD: number;
    chainAggregation: IChainAggregation[];
  }

  export interface IAssetsResponse {
    assets: IAsset[];
    totalAmountInUSD: number;
  }

  export interface ITransferTransaction {
    token: IBasicToken;
    amount: string;
    receiver: string;
  }

  export interface ITokenWithUSD {
    token: IToken;
    amount: string;
    amountInUSD: string;
    senderAddress: string;
  }

  export interface ISwap {
    aggregator: string;
    fromToken: ITokenWithUSD;
    toToken: ITokenWithUSD;
  }

  export interface ITokenChanges {
    from: string;
    fromChains: number[];
    to: string;
    toChains: number[];
    decr: ITokenWithUSD[];
    incr: ITokenWithUSD[];
    swaps: ISwap[];
    totalFeeInUSD: string;
    totalDecrAmountInUSD: string;
    totalIncrAmountInUSD: string;
    totalPaidAmountInUSD: string;
  }

  export interface ITransactionFees {
    freeGasFee: boolean;
    freeServiceFee: boolean;
    transactionServiceFeeAmountInUSD: string;
    transactionLPFeeAmountInUSD: string;
  }

  export interface IUserOpWithChain {
    chainId: number;
    userOpHash: string;
    eip7702Auth?: {
      chainId: number;
      nonce: number;
      address: string;
    };
    eip7702Delegated?: boolean;
  }

  export interface ITransaction {
    type: string;
    sender: string;
    receiver: string;
    transactionId: string;
    rootHash: string;
    userOps: IUserOpWithChain[];
    tokenChanges: ITokenChanges;
    transactionFees: ITransactionFees;
  }

  export interface EIP7702Authorization {
    userOpHash: string;
    signature: string;
  }

  export interface ISmartAccountOptions {
    name: string;
    version: string;
    ownerAddress: string;
    smartAccountAddress?: string;
    solanaSmartAccountAddress?: string;
    useEIP7702?: boolean;
  }

  export interface ITradeConfig {
    slippageBps?: number;
    usePrimaryTokens?: SUPPORTED_TOKEN_TYPE[];
  }

  export interface IUniversalAccountConfig {
    projectId: string;
    projectClientKey: string;
    projectAppUuid: string;
    smartAccountOptions?: ISmartAccountOptions;
    tradeConfig?: ITradeConfig;
    rpcUrl?: string;
  }

  export class UniversalAccount {
    constructor(config: IUniversalAccountConfig);
    getPrimaryAssets(): Promise<IAssetsResponse>;
    createTransferTransaction(payload: ITransferTransaction): Promise<ITransaction>;
    getSmartAccountOptions(): Promise<ISmartAccountOptions>;
    sendTransaction(
      transaction: ITransaction,
      signature: string,
      authorizations?: EIP7702Authorization[],
    ): Promise<{ transactionId: string } & Record<string, unknown>>;
    getTransaction(transactionId: string): Promise<unknown>;
    getTransactions(page?: number, limit?: number, tag?: string): Promise<unknown>;
    getEIP7702Deployments(): Promise<{ chainId: number; isDelegated?: boolean }[]>;
    getEIP7702Auth(
      chainIds: number[],
    ): Promise<{ chainId: number; nonce: number; address: string }[]>;
  }
}
