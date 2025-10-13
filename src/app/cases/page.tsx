"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

/* ------------------------------------------------------------ */
/* Types */
type RawDicom = Record<string, { vr?: string; Value?: any[] }>;

export type StudyRow = {
  id: string;
  patientName: string;
  patientId: string;
  studyDate: string;
  modality: string;
  description: string;
  studyInstanceUID: string;
  status?: "completed" | "pending" | "processing";
  // Additional fields for side panel
  accessionNumber?: string;
  studyTime?: string;
  patientBirthDate?: string;
  patientSex?: string;
  patientAge?: string;
  referringPhysician?: string;
  physicianOfRecord?: string;
  readingPhysician?: string;
  studyId?: string;
  numberOfSeries?: number;
  numberOfInstances?: number;
  institutionName?: string;
  stationName?: string;
};

/* ------------------------------------------------------------ */
/* Helper function to extract patient name */
const extractPatientName = (patientNameObj: any): string => {
  if (!patientNameObj) return "Unknown";

  if (typeof patientNameObj === "string") {
    return patientNameObj;
  }

  if (typeof patientNameObj === "object") {
    if (patientNameObj.Alphabetic) {
      return patientNameObj.Alphabetic;
    }
    if (patientNameObj.Ideographic) {
      return patientNameObj.Ideographic;
    }
    if (patientNameObj.Phonetic) {
      return patientNameObj.Phonetic;
    }
    return JSON.stringify(patientNameObj);
  }

  return String(patientNameObj);
};

/* ------------------------------------------------------------ */
/* Statistics Cards Component */
function StatisticsCards({ data }: { data: StudyRow[] }) {
  const stats = useMemo(() => {
    const totalStudies = data.length;
    const modalities = data.reduce((acc, study) => {
      const modality = study.modality || "Unknown";
      acc[modality] = (acc[modality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const todayStudies = data.filter(
      (study) => study.studyDate === today
    ).length;

    const uniquePatients = new Set(data.map((study) => study.patientId)).size;

    return {
      totalStudies,
      modalities,
      todayStudies,
      uniquePatients,
      topModality:
        Object.entries(modalities).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "None",
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Studies</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.totalStudies}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Unique Patients</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.uniquePatients}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Today's Studies</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.todayStudies}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Top Modality</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.topModality}
            </p>
          </div>
          <div className="p-3 bg-orange-100 rounded-lg">
            <svg
              className="w-6 h-6 text-orange-600"
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
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ */
/* Loading Skeleton Component */
function TableSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4 animate-pulse">
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-6 gap-4">
              <div className="h-4 bg-gray-200 rounded col-span-1"></div>
              <div className="h-4 bg-gray-200 rounded col-span-1"></div>
              <div className="h-4 bg-gray-200 rounded col-span-1"></div>
              <div className="h-4 bg-gray-200 rounded col-span-1"></div>
              <div className="h-4 bg-gray-200 rounded col-span-1"></div>
              <div className="h-4 bg-gray-200 rounded col-span-1"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ */
/* Status Badge Component */
function StatusBadge({ status }: { status?: string }) {
  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "completed":
        return { color: "bg-green-100 text-green-800", label: "Completed" };
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", label: "Pending" };
      case "processing":
        return { color: "bg-blue-100 text-blue-800", label: "Processing" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: "Unknown" };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {config.label}
    </span>
  );
}

/* ------------------------------------------------------------ */
/* Enhanced Side Panel Component */
function StudyDetailSidePanel({
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
    new Set(["basic", "clinical", "identification"])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (!study) return null;

  return (
    <div
      className={`
      fixed top-0 right-0 h-full w-96 bg-white shadow-xl border-l border-gray-200 
      transform transition-transform duration-300 ease-in-out z-40
      ${isOpen ? "translate-x-0" : "translate-x-full"}
      lg:relative lg:translate-x-0 lg:z-auto lg:flex lg:flex-col
      ${!isOpen ? "lg:hidden" : ""}
    `}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 truncate">
              {study.patientName}
            </h2>
            <p className="text-sm text-gray-500 mt-1 truncate">
              {study.studyDate} • {study.modality}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {activeTab === "patient" && (
              <div className="space-y-4">
                <CollapsibleSection
                  title="Basic Information"
                  isExpanded={expandedSections.has("basic")}
                  onToggle={() => toggleSection("basic")}
                >
                  <DetailItem label="Full Name" value={study.patientName} />
                  <DetailItem label="Patient ID" value={study.patientId} />
                  <DetailItem
                    label="Birth Date"
                    value={study.patientBirthDate}
                  />
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
              </div>
            )}

            {activeTab === "study" && (
              <div className="space-y-4">
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
              <div className="space-y-4">
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
                  <DetailItem
                    label="Institution"
                    value={study.institutionName}
                  />
                  <DetailItem label="Station Name" value={study.stationName} />
                </CollapsibleSection>

                <CollapsibleSection
                  title="Technical Details"
                  isExpanded={expandedSections.has("technical")}
                  onToggle={() => toggleSection("technical")}
                >
                  <DetailItem
                    label="Number of Series"
                    value={study.numberOfSeries?.toString()}
                  />
                  <DetailItem
                    label="Number of Instances"
                    value={study.numberOfInstances?.toString()}
                  />
                </CollapsibleSection>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Study Timeline
                  </h4>
                  <div className="space-y-3">
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

/* ------------------------------------------------------------ */
/* Collapsible Section Component */
function CollapsibleSection({
  title,
  children,
  isExpanded,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-lg transition-colors"
      >
        <span className="font-medium text-gray-900 text-sm">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transform transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isExpanded && (
        <div className="px-4 py-3 space-y-3 bg-white rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ */
/* Timeline Event Component */
function TimelineEvent({
  time,
  title,
  description,
  status,
}: {
  time?: string;
  title: string;
  description: string;
  status: "completed" | "pending" | "processing";
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      case "pending":
        return "bg-gray-300";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="flex items-start space-x-3">
      <div
        className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(status)}`}
      ></div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 text-sm">{title}</span>
          {time && <span className="text-xs text-gray-500">{time}</span>}
        </div>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ */
/* Detail Item Component */
function DetailItem({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value?: string;
  copyable?: boolean;
}) {
  const displayValue = value || "Not Available";

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
    }
  };

  return (
    <div className="flex flex-col">
      <dt className="text-xs font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900 flex items-start justify-between">
        <span className="break-words flex-1">{displayValue}</span>
        {copyable && value && (
          <button
            onClick={handleCopy}
            className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            title="Copy to clipboard"
          >
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        )}
      </dd>
    </div>
  );
}

/* ------------------------------------------------------------ */
/* Main Component */
export default function StudiesPage() {
  /* ---------- Component state ------------------------------------- */
  const [data, setData] = useState<StudyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<StudyRow | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  /* ---------- Table UI state -------------------------------------- */
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(10);

  /* ------------------------------------------------------------ */
  /* Fetch + parse studies ---------------------------------------- */
  const fetchStudies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/studies");
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const json = await res.json();

      const raw: RawDicom[] = Array.isArray(json?.data) ? json.data : [];

      const parsed: StudyRow[] = raw.map((s, i) => {
        const patientNameObj = s["00100010"]?.Value?.[0];
        const patientName = extractPatientName(patientNameObj);

        const studyInstanceUID =
          s["0020000D"]?.Value?.[0] ?? `study-${i}-${Date.now()}`;

        const getDicomValue = (tag: string): string | undefined => {
          const value = s[tag]?.Value?.[0];
          if (typeof value === "object" && value !== null) {
            return JSON.stringify(value);
          }
          return value;
        };

        // Random status for demo
        const statuses = ["completed", "pending", "processing"] as const;
        const randomStatus =
          statuses[Math.floor(Math.random() * statuses.length)];

        return {
          id: studyInstanceUID,
          patientName,
          patientId: getDicomValue("00100020") ?? "N/A",
          studyDate: getDicomValue("00080020") ?? "N/A",
          modality: getDicomValue("00080060") ?? "N/A",
          description:
            getDicomValue("00081030") ?? getDicomValue("0008103E") ?? "N/A",
          studyInstanceUID,
          status: randomStatus,
          // Additional fields
          accessionNumber: getDicomValue("00080050"),
          studyTime: getDicomValue("00080030"),
          patientBirthDate: getDicomValue("00100030"),
          patientSex: getDicomValue("00100040"),
          patientAge: getDicomValue("00101010"),
          referringPhysician: getDicomValue("00080090"),
          physicianOfRecord: getDicomValue("00081048"),
          readingPhysician: getDicomValue("00081060"),
          studyId: getDicomValue("00200010"),
          numberOfSeries: parseInt(getDicomValue("00201206") || "0"),
          numberOfInstances: parseInt(getDicomValue("00201208") || "0"),
          institutionName: getDicomValue("00080080"),
          stationName: getDicomValue("00081010"),
        };
      });

      setData(parsed);
    } catch (err) {
      console.error("Error fetching studies:", err);
      alert("Error loading studies");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  /* ------------------------------------------------------------ */
  /* Action handlers */
  const handleViewDetails = (study: StudyRow) => {
    setSelectedStudy(study);
    setIsSidePanelOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      await fetchStudies();
      alert("Upload successful");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ------------------------------------------------------------ */
  /* Columns */
  const columns = useMemo<ColumnDef<StudyRow>[]>(
    () => [
      {
        accessorKey: "patientName",
        header: () => <span className="font-medium">Patient</span>,
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">
                  {String(value).charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium text-gray-900">
                {value && value !== "Unknown" ? String(value) : "Unknown"}
              </span>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "patientId",
        header: () => <span className="font-medium">Patient ID</span>,
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <span className="text-gray-600">
              {value && value !== "N/A" ? String(value) : "N/A"}
            </span>
          );
        },
      },
      {
        accessorKey: "studyDate",
        header: () => <span className="font-medium">Study Date</span>,
        cell: ({ getValue }) => {
          const raw = getValue() as string;
          if (!raw || raw === "N/A") return "N/A";

          if (/^\d{8}$/.test(raw)) {
            const y = raw.slice(0, 4);
            const m = raw.slice(4, 6);
            const d = raw.slice(6, 8);
            return `${d}-${m}-${y}`;
          }
          return raw;
        },
        enableSorting: true,
      },
      {
        accessorKey: "modality",
        header: () => <span className="font-medium">Modality</span>,
        cell: ({ getValue }) => {
          const value = getValue();
          const modality = value && value !== "N/A" ? String(value) : "N/A";
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {modality}
            </span>
          );
        },
      },
      {
        accessorKey: "description",
        header: () => <span className="font-medium">Description</span>,
        cell: ({ getValue }) => {
          const value = getValue();
          const description = value && value !== "N/A" ? String(value) : "N/A";
          return (
            <div className="truncate max-w-[220px]" title={description}>
              {description}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: () => <span className="font-medium">Status</span>,
        cell: ({ getValue }) => {
          return <StatusBadge status={getValue() as string} />;
        },
      },
      {
        id: "actions",
        header: () => <span className="font-medium">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm"
              onClick={() => handleViewDetails(row.original)}
            >
              Details
            </button>
          </div>
        ),
      },
    ],
    []
  );

  /* ------------------------------------------------------------ */
  /* Table instance */
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const canPrevious = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();

  /* ------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto w-[95%] max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Medical Studies
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and review DICOM studies and patient data
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2.5 shadow-sm flex-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx={11}
                  cy={11}
                  r={6}
                  stroke="currentColor"
                  strokeWidth={2}
                />
              </svg>
              <input
                placeholder="Search patients, studies, modalities..."
                className="outline-none text-sm w-full bg-transparent placeholder-gray-400"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>

            {/* Upload */}
            <label className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload Study
                </>
              )}
              <input
                type="file"
                accept=".dcm"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards data={data} />

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Table Section */}
          <div
            className={`
            bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300
            ${isSidePanelOpen ? "lg:flex-1" : "lg:w-full"}
          `}
          >
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-200 gap-3">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {data.length}
                </span>{" "}
                studies
                {globalFilter && (
                  <span> (filtered from {data.length} total)</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 whitespace-nowrap">
                  Rows per page
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const size = Number(e.target.value);
                    setPageSize(size);
                    table.setPageSize(size);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {[5, 10, 20, 50].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((header) => (
                        <th
                          key={header.id}
                          colSpan={header.colSpan}
                          className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap"
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className={`flex items-center gap-2 select-none ${
                                header.column.getCanSort()
                                  ? "cursor-pointer hover:text-gray-700"
                                  : "cursor-default"
                              }`}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: (
                                  <span className="text-xs text-gray-400">
                                    ▲
                                  </span>
                                ),
                                desc: (
                                  <span className="text-xs text-gray-400">
                                    ▼
                                  </span>
                                ),
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={columns.length}>
                        <TableSkeleton />
                      </td>
                    </tr>
                  ) : table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-6 py-12 text-center"
                      >
                        <div className="text-gray-400 mb-2">
                          <svg
                            className="w-12 h-12 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">
                          {globalFilter
                            ? "No studies match your search criteria"
                            : "No studies found"}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {globalFilter
                            ? "Try adjusting your search terms"
                            : "Upload a study to get started"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-gray-50 transition-colors group ${
                          selectedStudy?.id === row.original.id
                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                            : ""
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 align-top text-sm text-gray-700 group-hover:text-gray-900 transition-colors"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {table.getPageCount() > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-t border-gray-200 gap-3">
                <div className="text-sm text-gray-600">
                  Page{" "}
                  <span className="font-semibold text-gray-900">
                    {pageIndex + 1}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {table.getPageCount()}
                  </span>
                  {" • "}
                  <span className="font-semibold text-gray-900">
                    {table.getFilteredRowModel().rows.length}
                  </span>{" "}
                  results
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!canPrevious}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    &lt;&lt;
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!canPrevious}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!canNext}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!canNext}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    &gt;&gt;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <StudyDetailSidePanel
            study={selectedStudy}
            isOpen={isSidePanelOpen}
            onClose={() => setIsSidePanelOpen(false)}
          />
        </div>

        {/* Mobile Side Panel Toggle */}
        {selectedStudy && !isSidePanelOpen && (
          <div className="lg:hidden fixed bottom-6 right-6 z-30">
            <button
              onClick={() => setIsSidePanelOpen(true)}
              className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors hover:shadow-xl"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Footer hint */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            💡 Click on any study's "Details" button to view comprehensive
            information in the side panel
          </p>
        </div>
      </div>
    </div>
  );
}
