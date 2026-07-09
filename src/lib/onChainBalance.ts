import { JsonRpcProvider, formatEther } from "ethers";
import { ARBITRUM_RPC_URL } from "@/lib/config";

/** Native ETH balance on the configured settlement chain (for testnet fallback display). */
export async function fetchSettlementNativeEth(address: string): Promise<number> {
  const provider = new JsonRpcProvider(ARBITRUM_RPC_URL);
  const wei = await provider.getBalance(address);
  const eth = Number(formatEther(wei));
  return Number.isFinite(eth) ? eth : 0;
}
