// src/app/components/PricingSection.tsx
"use client";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

const pricingData = [
  {
    feature: "Upfront Cost",
    traditional: "$50k - $200k+",
    vna: "$100k - $500k+",
    cloud: "$5k - $20k+",
    aurapacs: "None",
  },
  {
    feature: "Monthly Cost",
    traditional: "Varies (Maintenance)",
    vna: "Varies (Maintenance)",
    cloud: "$500 - $5k+",
    aurapacs: "Starts at $99",
  },
  {
    feature: "Hardware Required",
    traditional: "Yes (Servers, etc.)",
    vna: "Yes (Extensive)",
    cloud: "No",
    aurapacs: "No",
  },
  {
    feature: "AI Capabilities",
    traditional: "Limited / Add-on",
    vna: "Limited / Add-on",
    cloud: "Varies / Add-on",
    aurapacs: "Integrated",
  },
  {
    feature: "Accessibility",
    traditional: "On-premise only",
    vna: "On-premise only",
    cloud: "Web-based",
    aurapacs: "Web-based",
  },
  {
    feature: "Scalability",
    traditional: "Difficult & Expensive",
    vna: "Complex",
    cloud: "High",
    aurapacs: "Seamless",
  },
];

export const PricingSection = () => {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      id="pricing"
      ref={ref as React.RefObject<HTMLDivElement>}
      className="mx-auto max-w-7xl px-6 lg:px-8 py-12 sm:py-24"
    >
      <div
        className={`transition-all duration-1000 ${
          isIntersecting
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-cyan-400">
            TRANSPARENT PRICING
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Stop Overpaying for PACS
          </p>
          <p className="mt-6 text-lg leading-8 text-cyan-100">
            Traditional PACS solutions come with high upfront costs, expensive
            maintenance, and unpredictable storage fees. AuraPACS offers a
            simple, affordable monthly subscription.
          </p>
        </div>

        <div className="mt-16 flow-root">
          <div className="isolate -m-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-2">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6"
                    >
                      Feature
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-white"
                    >
                      Traditional PACS
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-white"
                    >
                      VNA
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-white"
                    >
                      Cloud PACS
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-3 pr-4 text-center text-sm font-semibold text-white sm:pr-6 bg-cyan-500/20 rounded-t-md"
                    >
                      AuraPACS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {pricingData.map((item) => (
                    <tr key={item.feature}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                        {item.feature}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-cyan-200 text-center">
                        {item.traditional}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-cyan-200 text-center">
                        {item.vna}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-cyan-200 text-center">
                        {item.cloud}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium text-cyan-300 text-center sm:pr-6 bg-cyan-500/10">
                        {item.aurapacs}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
