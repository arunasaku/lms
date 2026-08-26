"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import logoPic from "../../../public/logo.jpg";

export default function LoginPage() {
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        memberId,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid Member ID or Password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 py-6 text-center flex flex-col items-center border-b border-slate-800">
            <Image src={logoPic} alt="Potha - by Brandspire" priority className="w-28 h-28 object-cover rounded-full shadow-2xl ring-4 ring-slate-800 bg-[#fbfbf9]" />
          </div>
        
          <div className="bg-indigo-50/80 border-b border-indigo-100 p-4 text-center">
            <p className="text-sm font-semibold text-indigo-700 mb-2">Are you still not a member?</p>
            <Link href="/opac" className="inline-flex items-center justify-center bg-indigo-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm text-sm">
              Browse the Public Catalog
            </Link>
          </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Member ID</label>
              <input
                type="text"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                required
                placeholder="e.g. admin or M001"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
