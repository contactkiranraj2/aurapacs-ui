// src/app/components/CTASection.tsx
"use client";
import Link from "next/link";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

export const CTASection = () => {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.3 });

  return (
    <section
      ref={ref as React.RefObject<HTMLDivElement>}
      className="mx-auto max-w-7xl px-6 lg:px-8 py-12 sm:py-24"
    >
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-600 to-blue-700 shadow-2xl transition-all duration-1000 ${
          isIntersecting
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95"
        }`}
      >
        <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Modernize Your Imaging Workflow?
          </h2>
          <p className="mt-4 text-lg leading-8 text-cyan-100 max-w-2xl mx-auto">
            Discover how AuraPACS can reduce costs and improve diagnostics for
            your practice.
          </p>
          <div className="mt-10 flex items-center justify-center">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-white text-cyan-600 px-8 py-4 rounded-xl font-semibold hover:bg-cyan-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
