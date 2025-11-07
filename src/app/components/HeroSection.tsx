// src/app/components/HeroSection.tsx
"use client";
import Link from "next/link";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

export const HeroSection = () => {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      ref={ref as React.RefObject<HTMLDivElement>}
      className="relative px-6 lg:px-8"
    >
      <div className="mx-auto max-w-4xl py-20 sm:py-32 text-center">
        <div
          className={`transition-all duration-1000 ${
            isIntersecting
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            The Future of Medical Imaging is{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Affordable
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-cyan-100 max-w-3xl mx-auto sm:text-xl">
            AuraPACS provides a cost-effective, AI-powered medical imaging
            platform designed for modern healthcare. Say goodbye to expensive
            hardware and complex maintenance.
          </p>
        </div>
        <div
          className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-4 transition-all duration-1000 delay-300 ${
            isIntersecting
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <Link
            href="/register"
            className="group w-full sm:w-auto relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-2xl transition-all duration-300 hover:shadow-cyan-500/25 hover:scale-105"
          >
            <span className="relative z-10">Request a Demo</span>
          </Link>
          <Link
            href="#pricing"
            className="group w-full sm:w-auto flex items-center justify-center gap-x-2 text-sm font-semibold leading-6 text-cyan-100 hover:text-white transition-colors duration-200"
          >
            <span>See Pricing</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};
