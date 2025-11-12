"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { StudyRow } from "@/lib/types";

interface ShareStudyListModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: StudyRow | null;
}

export function ShareStudyListModal({ isOpen, onClose, study }: ShareStudyListModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        const { data, error } = await supabase.from("profiles").select("id, name, email");
        if (data) {
          setUsers(data);
        }
      };
      fetchUsers();
    } else {
      setSelectedUserId("");
      setError(null);
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!study || !selectedUserId) {
      setError("Please select a user to share with.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create a new study record for the selected user
      const { data: newStudy, error: insertError } = await supabase
        .from("studies")
        .insert({
          ...study,
          id: undefined, // Let Supabase generate a new UUID
          user_id: selectedUserId, // Assign to the new user
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to share study.");
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
          <h2 className="text-lg font-semibold leading-none tracking-tight">Share Study</h2>
          <p className="text-sm text-muted-foreground">
            Select a user to share the study with. This will add the study to their worklist.
          </p>
        </div>
        <form onSubmit={handleShare}>
          <div className="grid gap-4 py-4">
            <label htmlFor="user-select" className="text-sm font-medium">Select User</label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="bg-slate-700 border-slate-600 rounded-md p-2 w-full"
            >
              <option value="" disabled>-- Select a user --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {success && (
            <p className="text-green-400 text-sm text-center">
              Study shared successfully!
            </p>
          )}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={loading || !selectedUserId} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
              {loading ? "Sharing..." : "Share Study"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
