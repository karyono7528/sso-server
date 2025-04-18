"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface Application {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ApplicationsAdmin() {
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [newApp, setNewApp] = useState({
    name: "",
    redirectUris: ""
  });

  // Check if user is authenticated
  if (status === "unauthenticated") {
    redirect("/login");
  }

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch("/api/admin/applications");
        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        setError("Failed to load applications");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchApplications();
    }
  }, [status]);

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const redirectUrisArray = newApp.redirectUris
        .split(",")
        .map(uri => uri.trim())
        .filter(uri => uri);
      
      if (!newApp.name || redirectUrisArray.length === 0) {
        setError("Name and at least one redirect URI are required");
        return;
      }
      
      const response = await fetch("/api/admin/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newApp.name,
          redirectUris: redirectUrisArray,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create application");
      }
      
      const createdApp = await response.json();
      setApplications([...applications, createdApp]);
      setNewApp({ name: "", redirectUris: "" });
    } catch (error) {
      setError("Failed to create application");
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Manage OAuth Applications</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Create New Application</h2>
        <form onSubmit={handleCreateApp}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Application Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="My Application"
              value={newApp.name}
              onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="redirectUris">
              Redirect URIs (comma separated)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="redirectUris"
              type="text"
              placeholder="https://myapp.com/callback,https://myapp.com/oauth/callback"
              value={newApp.redirectUris}
              onChange={(e) => setNewApp({ ...newApp, redirectUris: e.target.value })}
              required
            />
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Create Application
          </button>
        </form>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
      
      {applications.length === 0 ? (
        <p>No applications found. Create one to get started.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {applications.map((app) => (
            <div key={app.id} className="border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-medium">{app.name}</h3>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="font-semibold">Client ID:</span>
                  <code className="ml-2 p-1 bg-gray-100 rounded">{app.clientId}</code>
                </div>
                <div>
                  <span className="font-semibold">Client Secret:</span>
                  <code className="ml-2 p-1 bg-gray-100 rounded">{app.clientSecret}</code>
                </div>
                <div>
                  <span className="font-semibold">Redirect URIs:</span>
                  <ul className="list-disc list-inside ml-2">
                    {app.redirectUris.map((uri, index) => (
                      <li key={index} className="text-sm truncate">
                        {uri}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-sm text-gray-500">
                  Created: {new Date(app.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}