"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

interface Session {
  id: string;
  device: string;
  lastActive: string;
  ip: string;
  current: boolean;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check if user is authenticated
  if (status === "unauthenticated") {
    redirect("/login");
  }

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/user/sessions");
        if (!response.ok) {
          throw new Error("Failed to fetch sessions");
        }
        const data = await response.json();
        setActiveSessions(data);
      } catch (error) {
        setError("Failed to load sessions");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchSessions();
    }
  }, [status]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const response = await fetch("/api/user/sessions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to revoke session");
      }

      // Remove the session from the list
      setActiveSessions(activeSessions.filter(s => s.id !== sessionId));
    } catch (error) {
      setError("Failed to revoke session");
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and account information.</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{session?.user?.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{session?.user?.email}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Active Sessions</h2>
          {session?.user?.id && (
            <Link href="/admin/applications" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Manage Applications
            </Link>
          )}
        </div>
        
        {activeSessions.length === 0 ? (
          <p>No active sessions found.</p>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {activeSessions.map((s) => (
                <li key={s.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-gray-900">
                        {s.device} {s.current && <span className="text-xs text-green-500 ml-2">(Current)</span>}
                      </p>
                      <p className="text-sm text-gray-500">
                        Last active: {new Date(s.lastActive).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        IP: {s.ip}
                      </p>
                    </div>
                    {!s.current && (
                      <button
                        onClick={() => handleRevokeSession(s.id)}
                        className="ml-2 bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}