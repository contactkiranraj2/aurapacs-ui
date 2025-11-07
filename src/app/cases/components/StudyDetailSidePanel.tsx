// src/app/cases/components/StudyDetailSidePanel.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { StudyRow } from "@/lib/types";
import { CollapsibleSection } from "./CollapsibleSection";
import { DetailItem } from "./DetailItem";
import { TimelineEvent } from "./TimelineEvent";
import { StatusBadge } from "./StatusBadge";

export function StudyDetailSidePanel({
  study,
  isOpen,
  onClose,
}: {
  study: StudyRow | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "patient" | "study" | "technical" | "timeline"
  >("patient");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["basic", "clinical", "identification", "study", "technical"]),
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  if (!study) return null;

  return (
    <div
      className={`
      fixed top-0 right-0 h-full w-full max-w-md bg-slate-900/80 backdrop-blur-lg shadow-2xl border-l border-white/10
      transform transition-transform duration-300 ease-in-out z-40
      ${isOpen ? "translate-x-0" : "translate-x-full"}
      lg:relative lg:translate-x-0 lg:z-auto lg:flex lg:flex-col lg:max-w-sm
      ${!isOpen ? "lg:hidden" : ""}
    `}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-white/10">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white truncate">
              {study.patientName}
            </h2>
            <p className="text-sm text-cyan-200/70 mt-1 truncate">
              {study.studyDate} • {study.modality}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Link href={`/viewer/${study.studyInstanceUID}`}>
              <button className="bg-cyan-500 text-white py-2 px-3 rounded-lg hover:bg-cyan-600 transition-colors font-medium text-sm shadow-lg hover:shadow-cyan-500/25">
                Open Viewer
              </button>
            </Link>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10">
          <nav className="flex space-x-1 px-4">
            {[
              { id: "patient", label: "Patient" },
              { id: "study", label: "Study" },
              { id: "technical", label: "Tech" },
              { id: "timeline", label: "Timeline" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as "patient" | "study" | "technical" | "timeline",
                  )
                }
                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? "text-cyan-300 border-b-2 border-cyan-400 bg-cyan-500/10"
                    : "text-cyan-200/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === "patient" && (
            <>
              <CollapsibleSection
                title="Basic Information"
                isExpanded={expandedSections.has("basic")}
                onToggle={() => toggleSection("basic")}
              >
                <DetailItem label="Full Name" value={study.patientName} />
                <DetailItem label="Patient ID" value={study.patientId} />
                <DetailItem label="Birth Date" value={study.patientBirthDate} />
                <DetailItem label="Sex" value={study.patientSex} />
                <DetailItem label="Age" value={study.patientAge} />
              </CollapsibleSection>
              <CollapsibleSection
                title="Clinical Information"
                isExpanded={expandedSections.has("clinical")}
                onToggle={() => toggleSection("clinical")}
              >
                <DetailItem
                  label="Referring Physician"
                  value={study.referringPhysician}
                />
                <DetailItem
                  label="Physician of Record"
                  value={study.physicianOfRecord}
                />
                <DetailItem
                  label="Reading Physician"
                  value={study.readingPhysician}
                />
              </CollapsibleSection>
            </>
          )}
          {activeTab === "study" && (
            <>
              <CollapsibleSection
                title="Study Details"
                isExpanded={expandedSections.has("study")}
                onToggle={() => toggleSection("study")}
              >
                <DetailItem label="Study Date" value={study.studyDate} />
                <DetailItem label="Study Time" value={study.studyTime} />
                <DetailItem
                  label="Accession Number"
                  value={study.accessionNumber}
                />
                <DetailItem label="Study ID" value={study.studyId} />
                <DetailItem label="Modality" value={study.modality} />
                <DetailItem label="Description" value={study.description} />
              </CollapsibleSection>
            </>
          )}
          {activeTab === "technical" && (
            <>
              <CollapsibleSection
                title="Identification"
                isExpanded={expandedSections.has("identification")}
                onToggle={() => toggleSection("identification")}
              >
                <DetailItem
                  label="Study Instance UID"
                  value={study.studyInstanceUID}
                  copyable
                />
                <DetailItem label="Institution" value={study.institutionName} />
                <DetailItem label="Station Name" value={study.stationName} />
              </CollapsibleSection>
            </>
          )}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              <TimelineEvent
                time={study.studyTime}
                title="Study Created"
                description="DICOM study was created and stored"
                status="completed"
              />
              <TimelineEvent
                time="14:30"
                title="Series Processed"
                description="Image series were processed"
                status="completed"
              />
              <TimelineEvent
                time="15:45"
                title="Quality Check"
                description="Study quality verification"
                status="pending"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/50">
          <div className="text-center">
            <StatusBadge status={study.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
