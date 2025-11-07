// src/app/components/Header.tsx
"use client";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="relative z-10">
      <nav className="flex items-center justify-between p-6 lg:px-8">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
            Aurapacs
          </span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link
            href="/login"
            className="text-cyan-100 hover:text-white font-medium transition-colors duration-200 text-sm sm:text-base"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 text-sm sm:text-base"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
};
