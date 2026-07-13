import { Header } from "@/components/Header";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-6">
            Privacy Policy
          </h1>

          <div className="space-y-6 text-sm text-neutral-600 leading-relaxed">
            <p className="text-xs text-neutral-400">Last updated: July 9, 2026</p>
            
            <p>
              At PPDDFF, we value your privacy above all else. This policy explains what happens to your data when you use our service.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-8 mb-2">
              1. Local-First Processing
            </h2>
            <p>
              Unlike standard converters, all conversions in PPDDFF are designed to process files inside isolated, short-lived temporary memory structures. We do not store, catalog, or inspect your documents.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-8 mb-2">
              2. Temporary File Lifespan
            </h2>
            <p>
              Any files written to our temporary disk space for the purpose of executing conversions are automatically deleted immediately after the response is completed. Additionally, a background sweeper runs automatically on every request to permanently delete any temp files older than 15 minutes.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-8 mb-2">
              3. Analytics and Tracking
            </h2>
            <p>
              PPDDFF contains no third-party tracking scripts, analytics, or advertisement SDKs. We do not store IP addresses or generate user profiles.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-8 mb-2">
              4. Complete Security
            </h2>
            <p>
              Because PPDDFF is fully open source, you can audit the codebase yourself, inspect how files are handled, or host the tool entirely offline on your local network.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-100 py-8 bg-neutral-50/50">
        <div className="container max-w-2xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-neutral-400 text-xs">
          <p>© {new Date().getFullYear()} PPDDFF. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0 font-medium">
            <Link href="/" className="hover:text-neutral-600">Home</Link>
            <Link href="/about" className="hover:text-neutral-600">About</Link>
            <Link href="/terms" className="hover:text-neutral-600">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
