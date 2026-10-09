/* Shared Outfit + JetBrains Mono instances for the taste surfaces.
   Every taste page wraps its tree in `.t-root` plus these two CSS
   variables, which is what gives taste.css its font-family, selection,
   focus-visible and reduced-motion rules their tokens. Pages that skip
   this render in the body fallback font (Arial), so always wrap. */
import { Outfit, JetBrains_Mono } from "next/font/google";

export const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jbmono",
});
