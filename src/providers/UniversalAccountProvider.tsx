"use client";

import {
  UNIVERSAL_ACCOUNT_VERSION,
  UniversalAccount,
  type EIP7702Authorization,
  type IAssetsResponse,
  type ITransaction,
} from "@particle-network/universal-account-sdk";
import { BrowserProvider, Signature, getBytes } from "ethers";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMagic } from "./MagicProvider";
import {
  ARBITRUM_CHAIN_ID,
  ARBITRUM_USDC_ADDRESS,
  IS_TESTNET_SETTLEMENT,
  PARTICLE_APP_ID,
  PARTICLE_CLIENT_KEY,
  PARTICLE_PROJECT_ID,
} from "@/lib/config";
import { fetchSettlementNativeEth } from "@/lib/onChainBalance";
import { RouteSummary, summarizeRoute } from "@/lib/route";
import {
  IS_DEMO,
  demoDelay,
  demoPrimaryAssets,
  demoRoute,
  demoSpend,
  demoTransactionId,
} from "@/lib/demo";

type UAContextType = {
  universalAccount: UniversalAccount | null;
  primaryAssets: IAssetsResponse | null;
  /** Native ETH on settlement chain; used when UA USD valuation is unavailable on testnet. */
  onChainNativeEth: number | null;
  balanceLoading: boolean;
  refreshBalance: () => Promise<void>;
  /** One-time EIP-7702 delegation of the EOA on Arbitrum (no-op when already delegated). */
  ensureDelegated: () => Promise<void>;
  /** Quote the cross-chain route for a payment without sending anything. */
  previewPayUsdcOnArbitrum: (receiver: string, amount: string) => Promise<RouteSummary | null>;
  /** Send USDC (settled on Arbitrum) to a receiver, drawing from any chain/asset the payer holds. */
  payUsdcOnArbitrum: (
    receiver: string,
    amount: string,
  ) => Promise<{ transactionId: string; route: RouteSummary | null }>;
};

const UAContext = createContext<UAContextType>({
  universalAccount: null,
  primaryAssets: null,
  onChainNativeEth: null,
  balanceLoading: false,
  refreshBalance: async () => {},
  ensureDelegated: async () => {},
  previewPayUsdcOnArbitrum: async () => null,
  payUsdcOnArbitrum: async () => ({ transactionId: "", route: null }),
});

export const useUniversalAccount = () => useContext(UAContext);

export function UniversalAccountProvider({ children }: { children: ReactNode }) {
  const { magic, address } = useMagic();
  const [primaryAssets, setPrimaryAssets] = useState<IAssetsResponse | null>(null);
  const [onChainNativeEth, setOnChainNativeEth] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const universalAccount = useMemo(() => {
    if (!address) return null;
    return new UniversalAccount({
      projectId: PARTICLE_PROJECT_ID,
      projectClientKey: PARTICLE_CLIENT_KEY,
      projectAppUuid: PARTICLE_APP_ID,
      smartAccountOptions: {
        // EIP-7702 mode: the EOA itself becomes the Universal Account.
        useEIP7702: true,
        name: "UNIVERSAL",
        version: UNIVERSAL_ACCOUNT_VERSION,
        ownerAddress: address,
      },
      tradeConfig: {
        slippageBps: 100,
      },
    });
  }, [address]);

  const refreshBalance = useCallback(async () => {
    if (!universalAccount || !address) {
      setPrimaryAssets(null);
      setOnChainNativeEth(null);
      return;
    }
    setBalanceLoading(true);
    if (IS_DEMO) {
      await demoDelay(600);
      setPrimaryAssets(demoPrimaryAssets());
      setOnChainNativeEth(null);
      setBalanceLoading(false);
      return;
    }
    try {
      const [assets, nativeEth] = await Promise.all([
        universalAccount.getPrimaryAssets(),
        IS_TESTNET_SETTLEMENT ? fetchSettlementNativeEth(address) : Promise.resolve(null),
      ]);
      setPrimaryAssets(assets);
      setOnChainNativeEth(nativeEth);
    } catch (err) {
      console.error("Failed to fetch unified balance:", err);
    } finally {
      setBalanceLoading(false);
    }
  }, [universalAccount, address]);

  // Deferred so the state updates happen outside the effect's synchronous body.
  useEffect(() => {
    const id = setTimeout(refreshBalance, 0);
    return () => clearTimeout(id);
  }, [refreshBalance]);

  const signAuthorization = useCallback(
    async (contractAddress: string, chainId: number, nonce?: number) => {
      if (!magic) throw new Error("Magic is not ready");
      return magic.wallet.sign7702Authorization({
        contractAddress,
        chainId,
        ...(nonce !== undefined && { nonce }),
      });
    },
    [magic],
  );

  // Magic cannot sign chain-agnostic (chainId 0) 7702 authorizations, so the EOA is
  // pre-delegated on Arbitrum with a chain-specific Type-4 transaction.
  const ensureDelegated = useCallback(async () => {
    if (!universalAccount || !magic || !address) {
      throw new Error("Account not ready");
    }
    const deployments = await universalAccount.getEIP7702Deployments();
    const arb = (deployments as { chainId: number; isDelegated?: boolean }[]).find(
      (d) => d.chainId === ARBITRUM_CHAIN_ID,
    );
    if (arb?.isDelegated) return;

    await magic.evm.switchChain(ARBITRUM_CHAIN_ID);
    const [auth] = await universalAccount.getEIP7702Auth([ARBITRUM_CHAIN_ID]);
    const authorization = await signAuthorization(auth.address, ARBITRUM_CHAIN_ID, auth.nonce + 1);
    await magic.wallet.send7702Transaction({
      to: address,
      data: "0x",
      authorizationList: [authorization],
    });
  }, [universalAccount, magic, address, signAuthorization]);

  const signAndSend = useCallback(
    async (transaction: ITransaction) => {
      if (!universalAccount || !magic || !address) {
        throw new Error("Account not ready");
      }

      // Sign any inline 7702 authorizations for chains not yet delegated.
      const authorizations: EIP7702Authorization[] = [];
      const nonceCache = new Map<string, string>();
      for (const userOp of transaction.userOps ?? []) {
        if (userOp.eip7702Auth && !userOp.eip7702Delegated) {
          const cacheKey = `${userOp.eip7702Auth.chainId}:${userOp.eip7702Auth.nonce}`;
          let serialized = nonceCache.get(cacheKey);
          if (!serialized) {
            const auth = await signAuthorization(
              userOp.eip7702Auth.address,
              userOp.eip7702Auth.chainId || userOp.chainId,
              userOp.eip7702Auth.nonce,
            );
            serialized = Signature.from({ r: auth.r, s: auth.s, v: auth.v }).serialized;
            nonceCache.set(cacheKey, serialized);
          }
          authorizations.push({ userOpHash: userOp.userOpHash, signature: serialized });
        }
      }

      const provider = new BrowserProvider(
        (magic as unknown as { rpcProvider: import("ethers").Eip1193Provider }).rpcProvider,
      );
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(getBytes(transaction.rootHash));

      return universalAccount.sendTransaction(
        transaction,
        signature,
        authorizations.length > 0 ? authorizations : undefined,
      );
    },
    [universalAccount, magic, address, signAuthorization],
  );

  // Quote only: no signatures, no state changes. The quote expires quickly, so the
  // pay path re-creates the transaction rather than reusing this one (delegation can
  // also invalidate the quoted 7702 nonces).
  const previewPayUsdcOnArbitrum = useCallback(
    async (receiver: string, amount: string) => {
      if (IS_DEMO) {
        await demoDelay(1400);
        return demoRoute(Number(amount));
      }
      if (!universalAccount) throw new Error("Account not ready");
      const transaction = await universalAccount.createTransferTransaction({
        token: {
          chainId: ARBITRUM_CHAIN_ID,
          address: ARBITRUM_USDC_ADDRESS,
        },
        amount,
        receiver,
      });
      return summarizeRoute(transaction);
    },
    [universalAccount],
  );

  const payUsdcOnArbitrum = useCallback(
    async (receiver: string, amount: string) => {
      if (IS_DEMO) {
        await demoDelay(2600);
        const route = demoRoute(Number(amount));
        demoSpend(route);
        return { transactionId: demoTransactionId(), route };
      }
      if (!universalAccount) throw new Error("Account not ready");
      await ensureDelegated();
      const transaction = await universalAccount.createTransferTransaction({
        token: {
          chainId: ARBITRUM_CHAIN_ID,
          address: ARBITRUM_USDC_ADDRESS,
        },
        amount,
        receiver,
      });
      const result = await signAndSend(transaction);
      return {
        transactionId: result.transactionId as string,
        route: summarizeRoute(transaction),
      };
    },
    [universalAccount, ensureDelegated, signAndSend],
  );

  const value = useMemo(
    () => ({
      universalAccount,
      primaryAssets,
      onChainNativeEth,
      balanceLoading,
      refreshBalance,
      ensureDelegated,
      previewPayUsdcOnArbitrum,
      payUsdcOnArbitrum,
    }),
    [
      universalAccount,
      primaryAssets,
      onChainNativeEth,
      balanceLoading,
      refreshBalance,
      ensureDelegated,
      previewPayUsdcOnArbitrum,
      payUsdcOnArbitrum,
    ],
  );

  return <UAContext.Provider value={value}>{children}</UAContext.Provider>;
}
