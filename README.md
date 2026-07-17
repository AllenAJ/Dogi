# Dogi — get paid from any chain, with just a link

**UXmaxx Hackathon submission · Universal Accounts Track**

Dogi turns cross-chain payments into something anyone can do — two products on the
same rails:

1. **Coffee page** — a Buy-me-a-coffee-style page for creators. Fans pick 1, 3, or 5
   coffees, add a note, log in with email, and pay in one tap.
2. **Payment links** — invoices and one-off requests ("$25 — Invoice #42") shared as
   a link.

In both cases the payer logs in with their **email** (no wallet app, no seed phrase)
and pays with **whatever they hold on any chain** — ETH on Base, SOL on Solana, USDT
on BNB Chain. The recipient always receives **USDC on Arbitrum**. Routing, bridging,
swapping, and gas are invisible.

## How it works

- **Magic embedded wallet** — email OTP login creates a non-custodial EOA. No extension,
  no seed phrase. (Magic Labs bonus challenge)
- **Particle Universal Accounts in EIP-7702 mode** — the user's EOA is upgraded
  *in place* into a chain-abstracted Universal Account. Same address, no migration, no
  smart-account deployment. One balance across Ethereum, Base, Arbitrum, BNB Chain,
  X Layer, and Solana. (Universal Accounts Track requirement)
- **Cross-chain value transfer** — paying a link calls
  `createTransferTransaction()` for USDC on **Arbitrum**; the SDK sources liquidity
  from whatever primary assets the payer holds on any chain and settles on Arbitrum.
  (Arbitrum bounty: Arbitrum is the settlement layer, invisible to the user)
- **Route preview before every payment** — the quote's `tokenChanges` are shown to
  the payer as a route card ("0.004 ETH on Base + 2 USDT on BNB Chain → $15 USDC on
  Arbitrum, fees $0.12") before they confirm, and again on the receipt.
- **Payments-received feed** — the dashboard reads incoming USDC `Transfer` events
  on Arbitrum straight from the chain, so creators see who paid them.
- **Shareable by design** — pay/tip links carry dynamic OG images (amount, name,
  note rendered server-side from the URL payload) and every link has a QR code.

### The EIP-7702 flow

1. `magic.auth.loginWithEmailOTP()` → embedded EOA
2. `new UniversalAccount({ smartAccountOptions: { useEIP7702: true, ownerAddress } })`
   → the EOA *is* the Universal Account
3. First payment: `magic.wallet.sign7702Authorization()` +
   `magic.wallet.send7702Transaction()` delegate the EOA to Particle's UA contract on
   Arbitrum (Type-4 transaction). Inline authorizations cover any other chains the
   route touches.
4. `ua.createTransferTransaction()` → sign one `rootHash` → `ua.sendTransaction()`

Key files:

| File | What it does |
|---|---|
| `src/providers/MagicProvider.tsx` | Magic SDK setup, email OTP login, session restore |
| `src/providers/UniversalAccountProvider.tsx` | UA init (7702 mode), unified balance, delegation, cross-chain pay |
| `src/app/dashboard/page.tsx` | Unified balance + coffee page setup + payment links |
| `src/app/tip/[code]/page.tsx` | Public creator page: buy 1/3/5 coffees cross-chain |
| `src/app/pay/[code]/page.tsx` | The pay page: log in with email → one-tap cross-chain payment |
| `src/lib/links.ts`, `src/lib/creator.ts` | Links and creator pages are self-contained — payload encoded in the URL, no backend |
| `src/lib/route.ts`, `src/components/RouteCard.tsx` | Parse the UA quote's `tokenChanges` into the route card shown before/after paying |
| `src/lib/payments.ts`, `src/components/RecentPayments.tsx` | On-chain feed of incoming USDC transfers on Arbitrum |
| `src/app/{pay,tip}/[code]/opengraph-image.tsx` | Dynamic OG share images rendered from the URL payload |

## Run it

```bash
npm install
cp .env.example .env.local   # add your keys (see below)
npm run dev
```

Open http://localhost:3000.

### Keys

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_MAGIC_API_KEY` | [dashboard.magic.link](https://dashboard.magic.link) → publishable API key (Dedicated Wallet) |
| `NEXT_PUBLIC_PARTICLE_PROJECT_ID` | [dashboard.particle.network](https://dashboard.particle.network) → project settings |
| `NEXT_PUBLIC_PARTICLE_CLIENT_KEY` | same project |
| `NEXT_PUBLIC_PARTICLE_APP_ID` | same project (create a Web app) |

### Testnet mode (optional)

Add these to `.env.local` for Arbitrum Sepolia testing:

```bash
NEXT_PUBLIC_SETTLEMENT_CHAIN_ID=421614
NEXT_PUBLIC_SETTLEMENT_USDC_ADDRESS=0x... # USDC token address on Arbitrum Sepolia
# Optional custom RPC (otherwise defaults to sepolia-rollup.arbitrum.io/rpc)
# NEXT_PUBLIC_ARB_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
```

### Demo flow

1. Log in with your email on the landing page.
2. Fund the account: send any supported token (ETH / USDC / USDT / BNB / SOL) on any
   supported chain to the address shown in the header.
3. On the dashboard, create your coffee page (name, avatar, price) and/or a payment
   link — both give you a shareable URL.
4. Open the URL (incognito or another device), log in with a *different* email, and
   buy a few coffees or pay the invoice.
5. The receiver gets USDC on Arbitrum; the payer's balance updates across chains.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 ·
`magic-sdk` + `@magic-ext/evm` · `@particle-network/universal-account-sdk` v2 · ethers 6

## Notes

- Payment links are fully client-side: the payload (receiver, amount, note) is
  base64url-encoded in the URL, so there's no backend or database to trust.
- EIP-7702 mode requires an embedded wallet that can sign Type-4 authorizations —
  that's why Magic is used rather than a JSON-RPC wallet like MetaMask.
- The UA SDK's package.json "exports" map lacks a "types" condition, so TypeScript
  can't see its declarations. `src/types/universal-account-sdk.d.ts` declares the
  subset of the SDK's API this app uses. (Don't map the package in tsconfig
  `paths` — Turbopack applies those mappings at runtime and would import the
  `.d.ts`, breaking the app.)
- Universal Accounts SDK v2 supported chains: Ethereum, Base, Arbitrum, BNB Chain,
  X Layer, Solana. Primary assets: ETH, USDC, USDT, BNB, SOL.
