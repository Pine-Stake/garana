import type React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import { Merriweather, Source_Code_Pro } from "next/font/google";
import "./globals.css";

const hubotSans = localFont({
  src: [
    {
      path: "../../public/fonts/hubot-sans/HubotSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/hubot-sans/HubotSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/hubot-sans/HubotSans-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/hubot-sans/HubotSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-hubot-sans",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Garana Launchpad",
  description: "Deploy your Stellar NFT collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hubotSans.variable} ${merriweather.variable} ${sourceCodePro.variable}`}
    >
      <body className="font-serif">
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  );
}
