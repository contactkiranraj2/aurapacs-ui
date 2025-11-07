// src/app/components/FeaturesSection.tsx
"use client";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

const features = [
  {
    title: "Cost-Effective Storage",
    description:
      "Leveraging modern cloud infrastructure to provide scalable and affordable DICOM image storage, eliminating the need for expensive on-premise hardware.",
    icon: (
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
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
  {
    title: "AI-Assisted Diagnosis",
    description:
      "Empowering radiologists with cutting-edge AI tools to enhance diagnostic accuracy, improve efficiency, and prioritize critical cases.",
    icon: (
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
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    title: "Advanced DICOM Viewer",
    description:
      "A high-performance, web-based DICOM viewer with essential tools for diagnostic imaging, accessible from anywhere.",
    icon: (
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
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: "Secure and Compliant",
    description:
      "Built with a security-first mindset, ensuring HIPAA compliance and data protection through end-to-end encryption.",
    icon: (
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
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
];

const FeatureCard = ({ feature, isIntersecting, index }: any) => (
  <div
    className={`relative group transition-all duration-700 ${
      isIntersecting
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-10"
    }`}
    style={{ transitionDelay: `${index * 150}ms` }}
  >
    <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 h-full shadow-lg hover:shadow-cyan-500/20">
      <div className="relative">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg mb-6">
          {feature.icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
        <p className="text-cyan-100">{feature.description}</p>
      </div>
    </div>
  </div>
);

export const FeaturesSection = () => {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      ref={ref as React.RefObject<HTMLDivElement>}
      className="mx-auto max-w-7xl px-6 lg:px-8 py-12 sm:py-24"
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base font-semibold leading-7 text-cyan-400">
          OUR FOCUS
        </h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Key Features for a Modern Practice
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-6xl">
        <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-2 lg:gap-12">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              isIntersecting={isIntersecting}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
