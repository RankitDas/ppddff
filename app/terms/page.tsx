import { Header } from "@/components/Header";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-6">
            Terms of Service
          </h1>

          <div className="space-y-6 text-sm text-neutral-600 leading-relaxed">
            <p className="text-xs text-neutral-400">Last updated: July 9, 2026</p>
            
            <p>
              By accessing or using PPDDFF, you agree to comply with and be bound by these terms. If you do not agree, please do not use the service.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-8 mb-2">
              1. Usage and License
            </h2>
            <p>
              PPDDFF is provided entirely free of charge under the MIT open-source license. You are permitted to copy, distribute, modify, and host the software in accordance with the terms of the MIT license.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-8 mb-2">
              2. Acceptable Use
            </h2>
            <p>
              You agree not to use the service to upload malicious code, viruses, or illegal materials. The service reserves the right to block requests or refuse service to anyone violating this guideline.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-8 mb-2">
              3. Disclaimer of Warranties
            </h2>
            <p>
              THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY.
            </p>

            <h2 className="text-lg font-bold text-neutral-900 mt-8 mb-2">
              4. Service Limitations
            </h2>
            <p>
              PPDDFF is a demonstration tool. We reserve the right to limit file uploads to 50 MB, modify conversion offerings, or terminate pages/routes at any time without notice.
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
            <Link href="/privacy" className="hover:text-neutral-600">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
