import { Archivo, Archivo_Narrow, Spline_Sans_Mono } from "next/font/google";

export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--cc-font-sans",
});

export const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--cc-font-narrow",
});

export const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--cc-font-mono",
});

export const ccFontVars = `${archivo.variable} ${archivoNarrow.variable} ${splineMono.variable}`;
