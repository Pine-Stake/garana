"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const words = ["Collection", "Art", "Legacy"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const TYPING_SPEED = 100;
  const DELETING_SPEED = 60;
  const DELAY_BETWEEN = 1500;

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText.length < currentWord.length) {
      timeout = setTimeout(() => {
        setDisplayText(currentWord.slice(0, displayText.length + 1));
      }, TYPING_SPEED);
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayText(currentWord.slice(0, displayText.length - 1));
      }, DELETING_SPEED);
    } else if (!isDeleting && displayText.length === currentWord.length) {
      timeout = setTimeout(() => setIsDeleting(true), DELAY_BETWEEN);
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWordIndex]);

  return (
    <div className="relative w-full py-[30vh] mb-8 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <h1 className="!font-serif text-4xl font-normal mb-2 text-brand-white">
          Create Your {displayText}
          <span className="animate-pulse">|</span>
        </h1>
        <p className="font-sans text-sm text-gray-400 mb-6">
          Launch your own NFT collection on the Stellar network. Fast, secure,
          and affordable minting for creators.
        </p>

        <Link href="/mint">
          <button className="relative inline-flex items-center justify-center px-10 py-3 font-sans text-base font-medium text-white overflow-hidden group cursor-pointer">
            <span className="absolute inset-0 p-[2px] bg-[linear-gradient(90deg,#fdda24,#99a1af,#fdda24)] bg-[length:200%_200%] animate-gradient rounded">
              <span className="block w-full h-full bg-black rounded"></span>
            </span>

            <span className="relative z-10">create now</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
