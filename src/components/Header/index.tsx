"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [pingResult, setPingResult] = useState<string | null>(null);

  const handlePing = async () => {
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_BASE}/ping`, {
        method: "GET",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      console.log("Ping response:", data);
      setPingResult(`✅ ${JSON.stringify(data)}`);
    } catch (error) {
      console.error("Ping failed:", error);
      setPingResult(`❌ ${error}`);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800">
            Note Generator
          </h1>

          <div className="flex items-center space-x-3">
            {/* Test Button */}
            <button
              onClick={handlePing}
              className="px-3 py-2 text-sm bg-green-500 text-white rounded-xl shadow hover:bg-green-600 transition"
            >
              Test API
            </button>

            {/* Login / Logout Button */}
            {session ? (
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl shadow hover:bg-gray-200 transition"
              >
                Logout ({session.user?.name})
              </button>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600 transition"
              >
                Login with Google
              </button>
            )}
          </div>
        </div>

        {/* Show result under the header */}
        {pingResult && (
          <div className="mt-2 text-sm text-gray-700">
            {pingResult}
          </div>
        )}
      </div>
    </header>
  );
}
