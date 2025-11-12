"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ShareStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyInstanceUID: string;
}

export function ShareStudyModal({
  isOpen,
  onClose,
  studyInstanceUID,
}: ShareStudyModalProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientMobile, setPatientMobile] = useState("");
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPatientName("");
      setPatientMobile("");
      setSelectedHospital("");
      setSelectedDoctor("");
      setError(null);
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile) {
          setUserRole(profile.role);
        }
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (userRole === "patient") {
      const fetchHospitals = async () => {
        const { data, error } = await supabase
          .from("hospitals")
          .select("id, name");
        if (data) setHospitals(data);
      };
      fetchHospitals();
    }
  }, [userRole]);

  useEffect(() => {
    if (selectedHospital) {
      const fetchDoctors = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name")
          .eq("role", "doctor")
          .eq("hospital_id", selectedHospital);
        if (data) setDoctors(data);
      };
      fetchDoctors();
    }
  }, [selectedHospital]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to share studies.");

      let shareData: any = {
        study_instance_uid: studyInstanceUID,
        shared_by: user.id,
      };

      if (userRole === "hospital-admin") {
        shareData = {
          ...shareData,
          patient_name: patientName,
          patient_mobile: patientMobile,
        };
      } else if (userRole === "patient") {
        shareData = { ...shareData, shared_with: selectedDoctor };
      }

      const { error } = await supabase.from("study_shares").insert(shareData);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="sm:max-w-[425px] bg-slate-800 text-white border-slate-700 rounded-lg p-6">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            Share Study
          </h2>
          <p className="text-sm text-muted-foreground">
            Share this study with another user.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {userRole === "hospital-admin" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="patient-name" className="text-right">
                    Patient Name
                  </label>
                  <input
                    id="patient-name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="col-span-3 bg-slate-700 border-slate-600 p-2 rounded"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="patient-mobile" className="text-right">
                    Patient Mobile
                  </label>
                  <input
                    id="patient-mobile"
                    type="tel"
                    value={patientMobile}
                    onChange={(e) => setPatientMobile(e.target.value)}
                    className="col-span-3 bg-slate-700 border-slate-600 p-2 rounded"
                  />
                </div>
              </>
            )}
            {userRole === "patient" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="hospital" className="text-right">
                    Hospital
                  </label>
                  <select
                    id="hospital"
                    value={selectedHospital}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    className="col-span-3 bg-slate-700 border-slate-600 rounded-md p-2"
                  >
                    <option value="">Select a hospital</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="doctor" className="text-right">
                    Doctor
                  </label>
                  <select
                    id="doctor"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="col-span-3 bg-slate-700 border-slate-600 rounded-md p-2"
                    disabled={!selectedHospital}
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {success && (
            <p className="text-green-400 text-sm text-center">
              Study shared successfully!
            </p>
          )}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Sharing..." : "Share"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
