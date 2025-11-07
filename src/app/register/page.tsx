"use client";
import { useState } from "react";
import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<"individual" | "institution">(
    "individual",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, accountType, orgName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setMessage(
        `Registration successful! Please check your email to set up your account.`,
      );
      setName("");
      setEmail("");
      setPassword("");
      setOrgName("");
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || String(err));
    } finally {
      setLoading(false);
    }
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
            onSubmit={handleRegister}
          >
            <h2 className="text-3xl font-bold text-center text-white">
              Create Account
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAccountType("individual")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  accountType === "individual"
                    ? "bg-cyan-500 text-white"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => setAccountType("institution")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  accountType === "institution"
                    ? "bg-cyan-500 text-white"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                Institution
              </button>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-cyan-100"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

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

            {accountType === "individual" ? (
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
                  required={accountType === "individual"}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            ) : (
              <div>
                <label
                  htmlFor="orgName"
                  className="block mb-2 text-sm font-medium text-cyan-100"
                >
                  Organization Name
                </label>
                <input
                  id="orgName"
                  type="text"
                  required={accountType === "institution"}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-cyan-200/50 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Example Hospital"
                />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            {message && (
              <p className="text-green-400 text-sm text-center">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="text-sm text-center text-cyan-200">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-cyan-400 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
