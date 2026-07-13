"use client";

import { CheckCircle2, Download, RefreshCw } from "lucide-react";

interface DownloadCardProps {
  originalFilename: string;
  targetFormat: string;
  downloadUrl: string;
  onReset: () => void;
  downloadFilename?: string;
}

export function DownloadCard({
  originalFilename,
  targetFormat,
  downloadUrl,
  onReset,
  downloadFilename,
}: DownloadCardProps) {
  const outputFilename = downloadFilename || (() => {
    const baseName = originalFilename.lastIndexOf(".") >= 0
      ? originalFilename.slice(0, originalFilename.lastIndexOf("."))
      : originalFilename;
    return `${baseName}.${targetFormat}`;
  })();

  return (
    <div className="w-full premium-3d-card p-6 flex flex-col items-center">
      <div className="w-12 h-12 rounded-xl bg-[#FAFAFA] flex items-center justify-center mb-4 text-[#22C55E] border border-[#E5E7EB] shadow-sm">
        <CheckCircle2 className="w-6 h-6" />
      </div>

      <h4 className="font-semibold text-[#111827] text-sm mb-1">
        Conversion Complete
      </h4>
      <p className="text-xs text-[#6B7280] mb-6 text-center max-w-xs truncate" title={outputFilename}>
        {outputFilename}
      </p>

      <div className="w-full flex flex-col gap-3">
        <a
          href={downloadUrl}
          download={outputFilename}
          className="w-full btn-3d-primary py-2.5 text-xs flex items-center justify-center gap-1.5 transition-transform"
        >
          <Download className="w-4 h-4" />
          <span>Download File</span>
        </a>
        
        <button
          onClick={onReset}
          className="w-full btn-3d-secondary py-2.5 text-xs flex items-center justify-center gap-1.5 transition-transform"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Convert Another File</span>
        </button>
      </div>
    </div>
  );
}
