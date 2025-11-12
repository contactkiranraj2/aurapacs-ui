"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

type LoginMethod = "email" | "mobile";

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");

  // State for email login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for mobile login
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Common state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.refresh();
      router.push("/cases");
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setOtpSent(true);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/cases");
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const getSubmitHandler = () => {
    if (loginMethod === "email") {
      return handleEmailLogin;
    }
    return otpSent ? handleVerifyOtp : handleSendOtp;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      <Header />

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <form
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-lg p-8 space-y-6"
            onSubmit={getSubmitHandler()}
          >
            <h2 className="text-3xl font-bold text-center text-white">
              Sign In
            </h2>

            <div className="flex justify-center bg-white/5 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`w-1/2 py-2 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === "email"
                    ? "bg-cyan-500 text-white"
                    : "text-cyan-200 hover:bg-white/10"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("mobile")}
                className={`w-1/2 py-2 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === "mobile"
                    ? "bg-cyan-500 text-white"
                    : "text-cyan-200 hover:bg-white/10"
                }`}
              >
                Mobile (Patient)
              </button>
            </div>

            {loginMethod === "email" && (
              <>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-cyan-100"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-cyan-100"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}

            {loginMethod === "mobile" && (
              <>
                <div>
                  <label
                    htmlFor="mobile"
                    className="block mb-2 text-sm font-medium text-cyan-100"
                  >
                    Mobile Number
                  </label>
                  <input
                    id="mobile"
                    type="tel"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Your mobile number"
                    disabled={otpSent}
                  />
                </div>

                {otpSent && (
                  <div>
                    <label
                      htmlFor="otp"
                      className="block mb-2 text-sm font-medium text-cyan-100"
                    >
                      OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter your OTP"
                    />
                  </div>
                )}
              </>
            )}

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <p className="text-sm text-center text-cyan-200">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-cyan-400 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
