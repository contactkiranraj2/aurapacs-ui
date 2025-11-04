"use client";

import { useState } from "react";

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

      setMessage(`Registration successful! Tenant ID: ${data.tenantId}`);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
        onSubmit={handleRegister}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Account Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="individual"
                checked={accountType === "individual"}
                onChange={() => setAccountType("individual")}
              />{" "}
              Individual
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="institution"
                checked={accountType === "institution"}
                onChange={() => setAccountType("institution")}
              />{" "}
              Institution
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            required
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {accountType === "individual" && (
          <div className="mb-4">
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              required
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        {accountType === "institution" && (
          <div className="mb-4">
            <label className="block mb-1 font-medium">Organization Name</label>
            <input
              type="text"
              required
              className="w-full border rounded px-3 py-2"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>
        )}

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {message && <p className="text-green-500 mb-2">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
