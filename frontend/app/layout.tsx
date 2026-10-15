import type { Metadata } from "next";
import { outfit, jbmono } from "./fonts";
import "./globals.css";
import "./taste.css";
import { Web3Provider } from "./web3-provider";

export const metadata: Metadata = {
  title: "Chundrigar Capital — PSX equities, settled on-chain",
  description:
    "Pakistan Stock Exchange equities tokenized 1:1 on Base Sepolia. Rupee and USDC settlement rails against the Treasury.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

const THEME_BOOT = `(function(){try{var s=localStorage.getItem("taste-theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${jbmono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
