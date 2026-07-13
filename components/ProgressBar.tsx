"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ProgressBarProps {
  statusText?: string;
}

export function ProgressBar({ statusText = "Converting file..." }: ProgressBarProps) {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        const increment = Math.max(1, Math.floor((95 - prev) / 10));
        return prev + increment;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white border border-neutral-100 rounded-xl p-6 shadow-sm flex flex-col items-center">
      <div className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center mb-4 text-neutral-500 border border-neutral-100">
        <Loader2 className="w-5 h-5 text-neutral-600 animate-spin" />
      </div>

      <h4 className="font-semibold text-neutral-900 text-sm mb-1">
        {statusText}
      </h4>
      <p className="text-xs text-neutral-400 mb-6">
        Processing files locally. Do not close this tab.
      </p>

      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-neutral-900 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-neutral-400 mt-2">
        {progress}%
      </span>
    </div>
  );
}
