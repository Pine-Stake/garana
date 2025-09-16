"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/Hero/HeroSection";

export default function HomePage() {
  const calculateExponentialProgress = (actualProgress: number) => {
    if (actualProgress <= 50) {
      return Math.pow(actualProgress / 50, 0.6) * 50;
    } else {
      return actualProgress;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <HeroSection />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h3 className="font-mono text-sm text-gray-500 uppercase tracking-wider">
            featured collections
          </h3>
        </div>

        <div className="mb-8">
          <Link href="/collection">
            <img
              src="/dramatic-black-and-white-landscape-with-stormy-clo.jpg"
              alt="Standing in the storm"
              className="w-full h-[400px] object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
            />
          </Link>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Link href="/collection">
                <h1 className="font-serif text-2xl font-normal text-brand-white hover:text-highlight transition-colors cursor-pointer">
                  Stellar Doggos
                </h1>
              </Link>
            </div>
            <div className="flex gap-4">
              <Link href="/mint">
                <Button
                  size="lg"
                  className="bg-transparent border-2 border-brand-white text-brand-white hover:bg-brand-white hover:text-brand-black font-sans text-lg px-8 py-2 h-auto rounded cursor-pointer"
                >
                  mint
                </Button>
              </Link>
              <Link href="/nft">
                <Button
                  size="lg"
                  className="bg-transparent border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-sans text-lg px-8 py-2 h-auto rounded cursor-pointer"
                >
                  NFT Platform
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-sans text-sm text-gray-400">
                first pfp project on stellar chain, woof woof
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="font-mono text-sm text-gray-400">20/400</div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((bar, index) => {
                    const actualProgress = (20 / 400) * 100;
                    const visualProgress =
                      calculateExponentialProgress(actualProgress);
                    const barProgress = Math.max(
                      0,
                      Math.min(100, (visualProgress - index * 20) * 5)
                    );

                    return (
                      <div key={index} className="relative">
                        <div className="w-5 h-2.5 border border-brand-white/40 rounded">
                          {barProgress > 0 && (
                            <div
                              className="h-full bg-highlight transition-all duration-300 rounded"
                              style={{ width: `${barProgress}%` }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="font-mono text-sm text-brand-white">24 xlm</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
