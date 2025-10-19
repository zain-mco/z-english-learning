'use client';

import { Heart, Github, Mail } from 'lucide-react';

/**
 * Footer Component
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-emerald-50/30 border-t border-gray-200/50 mt-20 py-2">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <p className="text-gray-600 text-sm">
          © {currentYear} Z English Learning. All rights reserved.
        </p>
        <p className="flex items-center gap-2 text-gray-600 text-sm">
          Made with <Heart size={16} className="text-red-500 fill-red-500" /> for learners worldwide
        </p>
      </div>

    </footer>
  );
}
