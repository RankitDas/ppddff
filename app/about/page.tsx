import { Header } from "@/components/Header";
import { Info, ShieldCheck, Heart } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-6">
            About PPDDFF
          </h1>

          <div className="space-y-6 text-sm text-neutral-600 leading-relaxed">
            <p>
              PPDDFF is a free, minimal, privacy-focused open-source file converter. It was built as a clean, transparent alternative to bloated online converters that store your documents on third-party servers.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-8 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-neutral-500" />
              <span>Privacy First</span>
            </h2>
            <p>
              Most online file conversion services require uploading your documents to their servers, exposing your sensitive data, contracts, or personal photos to third parties. 
              PPDDFF processes your files in isolated, temporary local environments. All temporary files are permanently purged automatically on every conversion request.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-8 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-neutral-500" />
              <span>How it Works</span>
            </h2>
            <p>
              PPDDFF leverages powerful, industry-standard native engines running inside temporary Node.js execution layers:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Images:</strong> Managed via Sharp for high-performance scaling and reformatting.</li>
              <li><strong>PDFs:</strong> Rendered page-by-page using pdfjs-dist, copy-merged or split with pdf-lib.</li>
              <li><strong>Documents:</strong> HTML rendering, Markdown, and plaintext extracted from docx using Mammoth, then printed to PDF via Puppeteer.</li>
              <li><strong>Spreadsheets:</strong> Processed locally using SheetJS (xlsx) for rapid table formatting and Puppeteer HTML print fallback.</li>
            </ul>

            <h2 className="text-lg font-bold text-neutral-900 mt-8 mb-2 flex items-center gap-2">
              <Heart className="w-5 h-5 text-neutral-500" />
              <span>Open Source & Free</span>
            </h2>
            <p>
              PPDDFF is entirely open source, meaning you can audit the code, run it locally on your computer, or host it on your own server. It has no advertisements, no tracking cookies, and no premium subscription limits.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-100 py-8 bg-neutral-50/50">
        <div className="container max-w-2xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-neutral-400 text-xs">
          <p>© {new Date().getFullYear()} PPDDFF. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0 font-medium">
            <Link href="/" className="hover:text-neutral-600">Home</Link>
            <Link href="/privacy" className="hover:text-neutral-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-neutral-600">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
