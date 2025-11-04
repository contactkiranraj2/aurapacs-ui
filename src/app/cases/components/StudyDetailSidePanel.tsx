"use client";

import React, { useState, useMemo } from "react";
import { StudyRow } from "@/lib/types"; // Centralized type definition
import { CollapsibleSection } from "./CollapsibleSection";
import { DetailItem } from "./DetailItem";
import { TimelineEvent, TimelineStatus } from "./TimelineEvent";
import { StatusBadge } from "./StatusBadge"; // Import StatusBadge

interface StudyDetailSidePanelProps {
  study: StudyRow | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StudyDetailSidePanel({
  study,
  isOpen,
  onClose,
}: StudyDetailSidePanelProps) {
  const [activeTab, setActiveTab] = useState<
    "patient" | "study" | "technical" | "timeline"
  >("patient");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(["basic", "clinical", "identification"]),
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(section)) {
        newExpanded.delete(section);
      } else {
        newExpanded.add(section);
      }
      return newExpanded;
    });
  };

  const formattedStudyDate = useMemo(() => {
    if (!study?.studyDate) return "N/A";
    const year = study.studyDate.substring(0, 4);
    const month = study.studyDate.substring(4, 6);
    const day = study.studyDate.substring(6, 8);
    return `${month}/${day}/${year}`;
  }, [study?.studyDate]);

  if (!study) return null;

  // Placeholder for timeline events. In a real application, these would come from the backend.
  const dummyTimelineEvents: {
    time: string;
    title: string;
    description: string;
    status: TimelineStatus;
  }[] = [
    {
      time: study.studyTime || "N/A",
      title: "Study Created",
      description: "DICOM study was created and stored",
      status: "completed",
    },
    {
      time: "14:30", // Placeholder
      title: "Series Processed",
      description: "Image series underwent initial processing",
      status: "processing",
    },
    {
      time: "15:45", // Placeholder
      title: "Quality Check",
      description: "Study quality verification initiated",
      status: "pending",
    },
    {
      time: "16:00", // Placeholder
      title: "Report Approved",
      description: "Radiology report was approved by physician",
      status: "approved",
    },
  ];

  return (
    <div
      className={`
      fixed top-0 right-0 h-full w-96 bg-white shadow-xl border-l border-gray-200
      transform transition-transform duration-300 ease-in-out z-40
      ${isOpen ? "translate-x-0" : "translate-x-full"}
      lg:relative lg:translate-x-0 lg:z-auto lg:flex lg:flex-col
      ${!isOpen ? "lg:hidden" : ""}
    `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="study-detail-panel-title"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex-1">
            <h2
              id="study-detail-panel-title"
              className="text-lg font-semibold text-gray-800 truncate"
            >
              {study.patientName || "Unknown Patient"}
            </h2>
            <p className="text-sm text-gray-500 mt-1 truncate">
              {formattedStudyDate} • {study.modality || "N/A"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Bookmark Study"
              aria-label="Bookmark this study"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close Panel"
              aria-label="Close study detail panel"
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
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-4">
            {[
              { id: "patient", label: "Patient", icon: "👤" },
              { id: "study", label: "Study", icon: "📄" },
              { id: "technical", label: "Technical", icon: "⚙️" },
              { id: "timeline", label: "Timeline", icon: "📅" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                <span className="mr-1.5" aria-hidden="true">
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {activeTab === "patient" && (
              <div
                className="space-y-4"
                role="tabpanel"
                aria-labelledby="patient-tab"
              >
                <CollapsibleSection
                  id="patient-basic-info"
                  title="Basic Information"
                  isExpanded={expandedSections.has("basic")}
                  onToggle={() => toggleSection("basic")}
                >
                  <DetailItem
                    label="Full Name"
                    value={study.patientName}
                    copyable
                  />
                  <DetailItem
                    label="Patient ID"
                    value={study.patientId}
                    copyable
                  />
                  <DetailItem
                    label="Birth Date"
                    value={study.patientBirthDate || "N/A"}
                  />
                  <DetailItem label="Sex" value={study.patientSex || "N/A"} />
                  <DetailItem label="Age" value={study.patientAge || "N/A"} />
                </CollapsibleSection>

                <CollapsibleSection
                  id="patient-clinical-info"
                  title="Clinical Information"
                  isExpanded={expandedSections.has("clinical")}
                  onToggle={() => toggleSection("clinical")}
                >
                  <DetailItem
                    label="Referring Physician"
                    value={study.referringPhysician || "N/A"}
                  />
                  <DetailItem
                    label="Physician of Record"
                    value={study.physicianOfRecord || "N/A"}
                  />
                  <DetailItem
                    label="Reading Physician"
                    value={study.readingPhysician || "N/A"}
                  />
                </CollapsibleSection>
              </div>
            )}

            {activeTab === "study" && (
              <div
                className="space-y-4"
                role="tabpanel"
                aria-labelledby="study-tab"
              >
                <CollapsibleSection
                  id="study-details"
                  title="Study Details"
                  isExpanded={expandedSections.has("study")}
                  onToggle={() => toggleSection("study")}
                >
                  <DetailItem
                    label="Study Date"
                    value={formattedStudyDate}
                    copyable
                  />
                  <DetailItem
                    label="Study Time"
                    value={study.studyTime || "N/A"}
                  />
                  <DetailItem
                    label="Accession Number"
                    value={study.accessionNumber || "N/A"}
                    copyable
                  />
                  <DetailItem label="Study ID" value={study.studyId} copyable />
                  <DetailItem
                    label="Modality"
                    value={study.modality || "N/A"}
                  />
                  <DetailItem
                    label="Description"
                    value={study.description || "N/A"}
                  />
                </CollapsibleSection>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Series Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">
                        {study.numberOfSeries || 0}
                      </span>
                      <p className="text-blue-700">Series</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">
                        {study.numberOfInstances || 0}
                      </span>
                      <p className="text-blue-700">Instances</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "technical" && (
              <div
                className="space-y-4"
                role="tabpanel"
                aria-labelledby="technical-tab"
              >
                <CollapsibleSection
                  id="technical-identification"
                  title="Identification"
                  isExpanded={expandedSections.has("identification")}
                  onToggle={() => toggleSection("identification")}
                >
                  <DetailItem
                    label="Study Instance UID"
                    value={study.studyInstanceUID}
                    copyable
                  />
                  <DetailItem
                    label="Institution"
                    value={study.institutionName || "N/A"}
                  />
                  <DetailItem
                    label="Station Name"
                    value={study.stationName || "N/A"}
                  />
                </CollapsibleSection>

                <CollapsibleSection
                  id="technical-details"
                  title="Technical Details"
                  isExpanded={expandedSections.has("technical")}
                  onToggle={() => toggleSection("technical")}
                >
                  <DetailItem
                    label="Number of Series"
                    value={study.numberOfSeries?.toString() || "N/A"}
                  />
                  <DetailItem
                    label="Number of Instances"
                    value={study.numberOfInstances?.toString() || "N/A"}
                  />
                </CollapsibleSection>
              </div>
            )}

            {activeTab === "timeline" && (
              <div
                className="space-y-4"
                role="tabpanel"
                aria-labelledby="timeline-tab"
              >
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Study Timeline
                  </h4>
                  <div className="space-y-3">
                    {dummyTimelineEvents.map((event, index) => (
                      <TimelineEvent
                        key={index}
                        time={event.time}
                        title={event.title}
                        description={event.description}
                        status={event.status}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-2">
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <button className="w-full text-left text-orange-700 hover:text-orange-900 py-1 text-sm">
                      📝 Add Clinical Notes
                    </button>
                    <button className="w-full text-left text-orange-700 hover:text-orange-900 py-1 text-sm">
                      🏷️ Add Tags
                    </button>
                    <button className="w-full text-left text-orange-700 hover:text-orange-900 py-1 text-sm">
                      📤 Export Report
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              Open Viewer
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Download
            </button>
          </div>
          <StatusBadge status={study.status} />
        </div>
      </div>
    </div>
  );
}
