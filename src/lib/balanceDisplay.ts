import { IS_TESTNET_SETTLEMENT } from "@/lib/config";
import { formatTokenAmount, formatUsd } from "@/lib/format";
import type { IAssetsResponse } from "@particle-network/universal-account-sdk";

export function balanceDisplay({
  primaryAssets,
  onChainNativeEth,
  settlementLabel,
}: {
  primaryAssets: IAssetsResponse | null;
  onChainNativeEth: number | null;
  settlementLabel: string;
}): { primary: string; secondary?: string } {
  const usdTotal = primaryAssets?.totalAmountInUSD ?? 0;
  const nativeEth = onChainNativeEth ?? 0;
  const assets = (primaryAssets?.assets ?? []).filter((a) => a.amount > 0);

  if (IS_TESTNET_SETTLEMENT && nativeEth > 0 && usdTotal === 0 && assets.length === 0) {
    return {
      primary: `${formatTokenAmount(nativeEth)} ETH`,
      secondary: `on ${settlementLabel}`,
    };
  }

  return { primary: formatUsd(usdTotal) };
}

export function hasLowUsdBalance(
  primaryAssets: IAssetsResponse | null,
  requiredUsd: number,
): boolean {
  if (IS_TESTNET_SETTLEMENT) return false;
  const total = primaryAssets?.totalAmountInUSD ?? 0;
  return primaryAssets !== null && total < requiredUsd;
}
