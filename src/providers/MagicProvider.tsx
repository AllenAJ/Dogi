"use client";

import { EVMExtension } from "@magic-ext/evm";
import { Magic as MagicBase } from "magic-sdk";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ARBITRUM_CHAIN_ID, ARBITRUM_RPC_URL, MAGIC_API_KEY } from "@/lib/config";

export type Magic = MagicBase<[EVMExtension]>;

type MagicContextType = {
  magic: Magic | null;
  /** EOA address of the logged-in user (also their Universal Account address in 7702 mode). */
  address: string | null;
  /** True while restoring an existing session on first load. */
  initializing: boolean;
  loginWithEmailOTP: (email: string) => Promise<string>;
  logout: () => Promise<void>;
};

const MagicContext = createContext<MagicContextType>({
  magic: null,
  address: null,
  initializing: true,
  loginWithEmailOTP: async () => "",
  logout: async () => {},
});

export const useMagic = () => useContext(MagicContext);

export function MagicProvider({ children }: { children: ReactNode }) {
  // Constructed lazily on the client only; Magic touches window/iframe internals.
  const [magic] = useState<Magic | null>(() => {
    if (typeof window === "undefined" || !MAGIC_API_KEY) return null;
    return new MagicBase(MAGIC_API_KEY, {
      extensions: [
        new EVMExtension([
          { rpcUrl: ARBITRUM_RPC_URL, chainId: ARBITRUM_CHAIN_ID, default: true },
        ]),
      ],
    });
  });
  const [address, setAddress] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(() => Boolean(MAGIC_API_KEY));

  // Restore session if the user is already logged in with Magic.
  useEffect(() => {
    if (!magic) return;
    let cancelled = false;
    (async () => {
      try {
        const loggedIn = await magic.user.isLoggedIn();
        if (loggedIn && !cancelled) {
          const info = await magic.user.getInfo();
          const publicAddress = info?.wallets?.ethereum?.publicAddress;
          if (publicAddress && !cancelled) setAddress(publicAddress);
        }
      } catch (err) {
        console.error("Session restore failed:", err);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [magic]);

  const loginWithEmailOTP = useCallback(
    async (email: string) => {
      if (!magic) throw new Error("Magic is not ready");
      const token = await magic.auth.loginWithEmailOTP({ email });
      if (!token) throw new Error("Login was cancelled");
      const info = await magic.user.getInfo();
      const publicAddress = info?.wallets?.ethereum?.publicAddress;
      if (!publicAddress) throw new Error("No wallet address returned by Magic");
      setAddress(publicAddress);
      return publicAddress;
    },
    [magic],
  );

  const logout = useCallback(async () => {
    if (magic && (await magic.user.isLoggedIn())) {
      await magic.user.logout();
    }
    setAddress(null);
  }, [magic]);

  const value = useMemo(
    () => ({ magic, address, initializing, loginWithEmailOTP, logout }),
    [magic, address, initializing, loginWithEmailOTP, logout],
  );

  return <MagicContext.Provider value={value}>{children}</MagicContext.Provider>;
}
