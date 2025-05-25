"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function SuperAdminPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  if(session?.user.role==="admin"){
    router.push("/")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, password, newRole }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          text: "Role updated to admin successfully!",
          type: "success",
        });
        router.push("/admin");
      } else {
        setMessage({
          text: data.message || "Failed to update role",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        text: "An error occurred while updating role",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-md text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to view this page.
          </p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Super Admin Panel</h1>
          </div>
          <p className="mt-2 text-blue-100">
            Elevate user privileges with secure authentication
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-1 text-gray-500" />
                  Secret PIN
                </div>
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter super admin PIN"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-1 text-gray-500" />
                  Your Password
                </div>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter your account password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center px-4 py-3 rounded-lg font-medium text-white transition-colors ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Processing...
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5 mr-2" />
                Update User Role
              </>
            )}
          </button>
        </form>

        {message.text && (
          <div
            className={`mx-6 mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {message.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              <p>{message.text}</p>
            </div>
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            <ShieldCheck className="inline h-3 w-3 mr-1" />
            Restricted to verified super admins only
          </p>
        </div>
      </div>
    </div>
  );
}
