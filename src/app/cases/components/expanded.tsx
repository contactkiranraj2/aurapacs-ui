"use client";

import React, { useState } from "react";

// Add this type for detailed study information
export type StudyDetail = StudyRow & {
  accessionNumber?: string;
  studyTime?: string;
  patientBirthDate?: string;
  patientSex?: string;
  patientAge?: string;
  referringPhysician?: string;
  studyId?: string;
  numberOfSeries?: number;
  numberOfInstances?: number;
  // Add other DICOM tags you want to display
};

// Add this component to your StudiesPage
function StudyDetailModal({
  study,
  isOpen,
  onClose,
}: {
  study: StudyDetail | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !study) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Study Details
            </h2>
            <p className="text-sm text-gray-500">Complete DICOM Information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Patient Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Patient Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Patient Name" value={study.patientName} />
              <DetailItem label="Patient ID" value={study.patientId} />
              <DetailItem label="Birth Date" value={study.patientBirthDate} />
              <DetailItem label="Sex" value={study.patientSex} />
              <DetailItem label="Age" value={study.patientAge} />
            </div>
          </div>

          {/* Study Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Study Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Study Date" value={study.studyDate} />
              <DetailItem label="Study Time" value={study.studyTime} />
              <DetailItem
                label="Accession Number"
                value={study.accessionNumber}
              />
              <DetailItem label="Modality" value={study.modality} />
              <DetailItem label="Study Description" value={study.description} />
              <DetailItem label="Study ID" value={study.studyId} />
              <DetailItem
                label="Referring Physician"
                value={study.referringPhysician}
              />
            </div>
          </div>

          {/* Technical Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Technical Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Study Instance UID"
                value={study.studyInstanceUID}
                className="col-span-2"
                copyable
              />
              <DetailItem
                label="Number of Series"
                value={study.numberOfSeries?.toString()}
              />
              <DetailItem
                label="Number of Instances"
                value={study.numberOfInstances?.toString()}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Add download functionality
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Download Study
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for detail items
function DetailItem({
  label,
  value,
  className = "",
  copyable = false,
}: {
  label: string;
  value?: string;
  className?: string;
  copyable?: boolean;
}) {
  const displayValue = value || "Not Available";

  const handleCopy = () => {
    navigator.clipboard.writeText(displayValue);
  };

  return (
    <div className={className}>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
        {displayValue}
        {copyable && value && (
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Copy to clipboard"
          >
            <svg
              className="w-4 h-4"
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
