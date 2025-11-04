"use client";

import React from "react";
import { StudyRow } from "../page";

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
