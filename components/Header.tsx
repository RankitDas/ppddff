import Link from "next/link";

export function LogoSvg({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 4H19L26 11V26C26 27.1 25.1 28 24 28H8C6.9 28 6 27.1 6 26V6C6 4.9 6.9 4 8 4Z"
        stroke="#0A84FF"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M19 4V11H26"
        stroke="#0A84FF"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M11 15V22M11 15H14C15.1 15 16 15.9 16 17C16 18.1 15.1 19 14 19H11M16 15V22M16 15H19C20.1 15 21 15.9 21 17C21 18.1 20.1 19 19 19H16"
        stroke="#0A84FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Header() {
  return (
    <header className="border-b border-[#111827]/10 bg-[#FAF7F0] sticky top-0 z-50">
      <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-[#111827]">
          <LogoSvg className="w-7 h-7" />
          <span className="tracking-tight text-xl font-bold font-doodle">PPDDFF</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm text-[#6B7280] font-medium">
          <Link href="/about" className="hover:text-[#111827] transition-colors">
            About
          </Link>
          <Link href="/privacy" className="hover:text-[#111827] transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[#111827] transition-colors">
            Terms
          </Link>
        </nav>
      </div>
    </header>
  );
}
