import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MagicProvider } from "@/providers/MagicProvider";
import { UniversalAccountProvider } from "@/providers/UniversalAccountProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dogi: get paid from any chain",
  description:
    "Treat pages for creators and payment links for everyone. Fans and clients pay with any token on any chain. You receive USDC on Arbitrum. Powered by Particle Universal Accounts (EIP-7702) and Magic.",
  icons: {
    icon: "/mascot.gif",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col">
        <MagicProvider>
          <UniversalAccountProvider>{children}</UniversalAccountProvider>
        </MagicProvider>
      </body>
    </html>
  );
}
