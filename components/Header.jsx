'use client';

import Link from 'next/link';

/**
 * Sticky Header Component
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-emerald-100/50 shadow-sm">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-14 h-14 bg-gradient-to-br from-primary via-emerald-500 to-accent rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 flex items-center justify-center">
              <span className="text-white font-bold text-3xl">Z</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-emerald-600 to-accent bg-clip-text text-transparent">
                Z English Learning
              </h1>
              <p className="text-xs text-gray-600 font-medium">Master vocabulary with confidence</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
