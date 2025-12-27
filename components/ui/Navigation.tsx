import Link from "next/link"

export function Navigation({ currentPath }: { currentPath?: string }) {
  const navItems = [
    { href: "/", label: "Home", isActive: currentPath === "/" },
    { href: "/dashboard", label: "Dashboard", isActive: currentPath === "/dashboard" },
    { href: "/pricing", label: "Pricing", isActive: currentPath === "/pricing" },
    { href: "/agency/dashboard", label: "Agency Portal", isActive: currentPath === "/agency" }
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/50 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-white">2ndmynd</span>
          </Link>
          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  item.isActive 
                    ? "text-emerald-400" 
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
