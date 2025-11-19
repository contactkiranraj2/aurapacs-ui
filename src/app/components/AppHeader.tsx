"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const AppHeader = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        if (profileData) {
          setProfile(profileData);
        }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      // Call your logout API route
      const res = await fetch("/api/auth/logout", { method: "POST" });

      if (!res.ok) {
        console.error("Logout failed:", await res.text());
        return;
      }

      console.log("✅ Logout successful");
      router.push("/login");
    } catch (error) {
      console.error("💥 Logout error:", error);
    }
  };

  return (
    <header className="relative z-10 bg-gradient-to-r from-teal-700 to-cyan-700">
      <nav className="flex items-center justify-between px-4 py-3">
        {/* LEFT: Logo */}
        <div className="flex items-center">
          <Link href="/cases" className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-2 shadow-md">
              <svg
                className="w-5 h-5 text-white"
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
            <span className="text-lg font-semibold bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
              Aurapacs
            </span>
          </Link>
        </div>

        {/* RIGHT: User + Logout */}
        <div className="flex items-center space-x-3">
          {user && (
            <div className="text-right leading-tight">
              <p className="text-white text-sm font-semibold">
                {user.email || user.phone}
              </p>
              <p className="text-cyan-200 text-xs">{profile?.role}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-md"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
};
