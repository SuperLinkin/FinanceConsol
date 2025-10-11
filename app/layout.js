import { Manrope } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "./layout-client";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata = {
  title: "CLOE - Your Optimization Engine",
  description: "Professional financial consolidation and reporting tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} antialiased`}
        style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
        suppressHydrationWarning
      >
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}