"use client";

import { useState, ComponentType } from "react";
import { Header, LogoSvg } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { ConvertOptions } from "@/components/ConvertOptions";
import { ProgressBar } from "@/components/ProgressBar";
import { DownloadCard } from "@/components/DownloadCard";
import { 
  AlertCircle, Shield, Zap, Sparkles, HelpCircle, 
  Combine, Scissors, Minimize, FileSpreadsheet, FileUp, 
  FileText, Image as ImageIcon, FileCode, ArrowLeft, Database
} from "lucide-react";

// List of all supported input formats
const ALLOWED_EXTS = [
  "png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff", "svg",
  "docx", "xlsx", "xls", "csv", "txt", "html", "md",
  "json", "yaml", "yml", "xml"
];

type ActiveTool = 
  | "quick"
  | "merge"
  | "split"
  | "compress"
  | "pdf-to-excel"
  | "excel-to-pdf"
  | "word-to-pdf"
  | "jpg-to-pdf"
  | "md-to-pdf"
  | "json-to-yaml";

interface ToolConfig {
  id: ActiveTool;
  title: string;
  description: string;
  allowedExts: string[];
  allowMultiple: boolean;
  targetFormat: string;
  icon: ComponentType<{ className?: string }>;
}

const TOOLS: Record<ActiveTool, ToolConfig> = {
  quick: {
    id: "quick",
    title: "Quick Convert",
    description: "Detects format automatically and converts to any compatible target.",
    allowedExts: ALLOWED_EXTS,
    allowMultiple: false,
    targetFormat: "",
    icon: Sparkles,
  },
  merge: {
    id: "merge",
    title: "Merge PDF",
    description: "Combine multiple PDF files into a single PDF document in custom order.",
    allowedExts: ["pdf"],
    allowMultiple: true,
    targetFormat: "merge",
    icon: Combine,
  },
  split: {
    id: "split",
    title: "Split PDF",
    description: "Separate a multi-page PDF document into single-page PDFs.",
    allowedExts: ["pdf"],
    allowMultiple: false,
    targetFormat: "split",
    icon: Scissors,
  },
  compress: {
    id: "compress",
    title: "Compress PDF",
    description: "Reduce file sizes of PDF documents locally using stream compression.",
    allowedExts: ["pdf"],
    allowMultiple: false,
    targetFormat: "compress",
    icon: Minimize,
  },
  "pdf-to-excel": {
    id: "pdf-to-excel",
    title: "PDF to Excel",
    description: "Convert tabular PDF sheets into structured Excel (.xlsx) files.",
    allowedExts: ["pdf"],
    allowMultiple: false,
    targetFormat: "xlsx",
    icon: FileSpreadsheet,
  },
  "excel-to-pdf": {
    id: "excel-to-pdf",
    title: "Excel to PDF",
    description: "Generate clean, print-ready PDF pages from spreadsheet files.",
    allowedExts: ["xlsx", "xls", "csv"],
    allowMultiple: false,
    targetFormat: "pdf",
    icon: FileUp,
  },
  "word-to-pdf": {
    id: "word-to-pdf",
    title: "Word to PDF",
    description: "Convert modern Microsoft Word documents (.docx) to PDF format.",
    allowedExts: ["docx"],
    allowMultiple: false,
    targetFormat: "pdf",
    icon: FileText,
  },
  "jpg-to-pdf": {
    id: "jpg-to-pdf",
    title: "JPG to PDF",
    description: "Convert JPEG, JPG, PNG, WEBP, and GIF images to PDF format.",
    allowedExts: ["jpg", "jpeg", "png", "webp", "gif"],
    allowMultiple: false,
    targetFormat: "pdf",
    icon: ImageIcon,
  },
  "md-to-pdf": {
    id: "md-to-pdf",
    title: "Markdown to PDF",
    description: "Transform Markdown text documents into beautifully formatted PDF documents.",
    allowedExts: ["md"],
    allowMultiple: false,
    targetFormat: "pdf",
    icon: FileCode,
  },
  "json-to-yaml": {
    id: "json-to-yaml",
    title: "JSON to YAML",
    description: "Re-serialize JSON data structures into clean YAML structures.",
    allowedExts: ["json"],
    allowMultiple: false,
    targetFormat: "yaml",
    icon: Database,
  },
};

export default function Home() {
  const [activeTool, setActiveTool] = useState<ActiveTool>("quick");
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<{ downloadUrl: string; targetFormat: string; downloadFilename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const handleSendFeedback = () => {
    if (!feedback.trim()) return;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=rankitdasx@gmail.com&su=Feedback%20for%20PPDDFF&body=${encodeURIComponent(feedback)}`;
    window.open(gmailUrl, "_blank");
  };

  const currentTool = TOOLS[activeTool];

  const handleConvert = async (to: string) => {
    if (files.length === 0) return;
    setConverting(true);
    setError(null);

    const formData = new FormData();
    if (to === "merge") {
      files.forEach((f) => formData.append("files", f));
    } else {
      formData.append("file", files[0]!);
    }
    formData.append("to", to);

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Conversion failed (Status ${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Extract filename from response headers
      const disposition = res.headers.get("Content-Disposition");
      let downloadFilename = `converted.${to}`;
      if (disposition && disposition.indexOf("attachment") !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          downloadFilename = decodeURIComponent(matches[1].replace(/['"]/g, ""));
        }
      }

      setResult({ downloadUrl: url, targetFormat: to, downloadFilename });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "An unexpected error occurred during conversion.");
    } finally {
      setConverting(false);
    }
  };

  const handleReset = () => {
    if (result) {
      URL.revokeObjectURL(result.downloadUrl);
    }
    setFiles([]);
    setResult(null);
    setError(null);
  };

  const handleToolChange = (toolId: ActiveTool) => {
    handleReset();
    setActiveTool(toolId);
    document.getElementById("converter-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F7] relative overflow-hidden font-sans">
      {/* Absolute positioned thin background vector guidelines (extremely subtle) */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full border border-[#0A84FF] opacity-[0.015] -translate-y-1/2 translate-x-1/4 pointer-events-none select-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full border border-[#0A84FF] opacity-[0.02] -translate-y-1/2 translate-x-1/4 pointer-events-none select-none" />
      <div className="absolute top-[35%] -left-60 w-[600px] h-[600px] rounded-full border border-[#0A84FF] opacity-[0.015] pointer-events-none select-none" />
      <div className="absolute top-[65%] right-[-200px] w-[700px] h-[700px] rounded-full border border-[#0A84FF] opacity-[0.012] pointer-events-none select-none" />
      
      {/* Dots grid overlay (subtle) */}
      <div className="absolute inset-0 bg-[radial-gradient(#0A84FF_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.012] pointer-events-none select-none" />

      <Header />

      {/* Hero Section */}
      <main className="flex-1 py-12 md:py-20 relative z-10">
        <div className="container max-w-5xl mx-auto px-4">
          
          {/* Centered Hero Layout */}
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24 flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <LogoSvg className="w-5 h-5" />
              <span className="text-[10px] font-bold text-[#0A84FF] tracking-widest uppercase font-doodle">Open-source File Converter</span>
            </div>
            <h1 className="text-4xl md:text-[50px] font-bold font-doodle text-[#111827] tracking-tight leading-[1.08] mb-5">
              Convert PDFs, Images, Word, Excel and more — completely free.
            </h1>
            <p className="text-sm md:text-base text-[#6B7280] font-normal leading-relaxed mb-8 max-w-xl">
              Secure local conversions with zero tracking. <strong className="text-[#111827] font-bold font-doodle">PPDDFF</strong> processes files in sandbox environments. Upload up to <strong className="text-[#111827] font-semibold">50 MB</strong>.
            </p>

            {/* Converter Card Section */}
            <div id="converter-section" className="w-full max-w-md scroll-mt-20 text-left mx-auto">
              <div className="premium-3d-card p-4 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider block mb-0.5">
                    Selected Tool
                  </span>
                  <span className="text-sm font-semibold text-[#111827]">
                    {currentTool.title}
                  </span>
                </div>
                {activeTool !== "quick" && (
                  <button
                    onClick={() => handleToolChange("quick")}
                    className="flex items-center gap-1 text-xs text-[#111827] font-semibold border border-[#E5E7EB] border-b-2 hover:bg-[#FAFAFA] active:translate-y-0.5 transition-all px-2.5 py-1 rounded-md"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Reset to Quick</span>
                  </button>
                )}
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex flex-col gap-3">
                  <div className="flex items-start gap-2.5 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-0.5">Operation Failed</span>
                      <span>{error}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="bg-red-100 hover:bg-red-200/80 text-red-800 font-semibold text-[10px] px-3 py-1.5 rounded-md self-end transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {files.length === 0 && !converting && !result && (
                <UploadZone
                  onFileSelect={setFiles}
                  allowedExtensions={currentTool.allowedExts}
                  allowMultiple={currentTool.allowMultiple}
                />
              )}

              {files.length > 0 && !converting && !result && (
                <ConvertOptions
                  files={files}
                  onConvert={handleConvert}
                  onCancel={handleReset}
                  isMulti={currentTool.allowMultiple}
                />
              )}

              {converting && <ProgressBar statusText={`${currentTool.title} in progress...`} />}

              {result && (
                <DownloadCard
                  originalFilename={files[0]?.name || "output"}
                  targetFormat={result.targetFormat}
                  downloadUrl={result.downloadUrl}
                  onReset={handleReset}
                  downloadFilename={result.downloadFilename}
                />
              )}
            </div>
          </div>

          {/* Tools Dashboard Grid */}
          <section className="mb-20">
            <h2 className="text-xl font-bold font-doodle text-[#111827] mb-6">Tools Directory</h2>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.values(TOOLS).map((tool) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.id}
                    onClick={() => handleToolChange(tool.id)}
                    className={`premium-3d-card p-5 cursor-pointer text-left flex flex-col justify-between min-h-[140px] ${
                      activeTool === tool.id
                        ? "border-[#0A84FF] border-b-[3px] bg-[#FAFAFA]"
                        : "premium-3d-card-hover"
                    }`}
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] mb-3 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-[#111827] text-sm mb-1">{tool.title}</h3>
                      <p className="text-xs text-[#6B7280] leading-normal">{tool.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Value Props Section */}
          <section className="grid md:grid-cols-3 gap-8 py-10 border-t border-[#DADADA] mb-20">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] mb-2">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-bold font-doodle text-[#111827] text-sm">Privacy Guaranteed</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Files are strictly held in temporary memory structures and isolated sandboxes. Cleanups purge files older than 15 minutes automatically.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] mb-2">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-bold font-doodle text-[#111827] text-sm">Local Processing</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                All rendering happens inside dedicated server instances utilizing Sharp, pdfjs-dist, and Puppeteer without database storage.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] mb-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold font-doodle text-[#111827] text-sm">Open Architecture</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Auditable. Safe. Host it on your local network or run it completely offline. No tracking cookies or account logins.
              </p>
            </div>
          </section>

          {/* Feedback Section */}
          <section className="mb-20">
            <h2 className="text-xl font-bold font-doodle text-[#111827] mb-6">Send Feedback</h2>
            <div className="premium-3d-card p-6 max-w-xl">
              <p className="text-xs text-[#6B7280] mb-4">
                Have a question, feedback, or found a problem? Write your message below and send it directly via Gmail.
              </p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your mail or feedback here..."
                rows={4}
                className="w-full text-sm text-[#111827] placeholder-[#9CA3AF] border border-[#E5E7EB] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#0A84FF] focus:border-[#0A84FF] transition-colors resize-none mb-4"
              />
              <button
                onClick={handleSendFeedback}
                disabled={!feedback.trim()}
                className="btn-3d-primary py-2 px-5 text-xs font-semibold disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
              >
                Send via Gmail
              </button>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-10 border-t border-[#DADADA] mb-10">
            <h2 className="text-xl font-bold font-doodle text-[#111827] mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#6B7280]" />
              <span>Frequently Asked Questions</span>
            </h2>
            <div className="space-y-6 max-w-3xl">
              <div>
                <h4 className="font-semibold text-[#111827] text-sm mb-1.5">How is my privacy protected?</h4>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  PPDDFF does not persist files on disk permanently. Conversions are held inside short-lived sandboxes and a sweeper program purges old temp files every 15 minutes.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#111827] text-sm mb-1.5">What is the upload size limit?</h4>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  PPDDFF permits uploading files of up to <strong className="text-[#111827] font-semibold">50 MB</strong> per conversion request.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#111827] text-sm mb-1.5">How does PDF to Excel extraction work?</h4>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  The PDF to Excel converter reads the geometric coordinates of text content inside the document and lines up adjacent rows and columns to reconstruct the data structure directly into a clean `.xlsx` sheet.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DADADA] py-8 bg-[#FAFAFA] mt-auto relative z-10">
        <div className="container max-w-5xl mx-auto px-4 text-center text-[#9CA3AF] text-xs">
          <p>© {new Date().getFullYear()} PPDDFF. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
