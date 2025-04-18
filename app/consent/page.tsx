"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Application {
  id: string;
  name: string;
  clientId: string;
}

export default function ConsentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const responseType = searchParams.get("response_type");
  const state = searchParams.get("state");
  const scope = searchParams.get("scope");

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!clientId) {
        setError("Missing client ID");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/oauth/applications?clientId=${clientId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch application details");
        }
        
        const data = await response.json();
        setApplication(data);
      } catch (error) {
        setError("Could not load application details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchApplicationDetails();
    } else {
      setLoading(false);
      setError("Missing client ID");
    }
  }, [clientId]);

  const handleConsent = async (allow: boolean) => {
    if (!allow) {
      // User denied consent, redirect back with error
      const errorUrl = new URL(redirectUri || "/");
      errorUrl.searchParams.append("error", "access_denied");
      if (state) {
        errorUrl.searchParams.append("state", state);
      }
      router.push(errorUrl.toString());
      return;
    }

    // User allowed consent, redirect to authorize endpoint to complete the flow
    const authorizeUrl = new URL("/api/oauth/authorize", window.location.origin);
    
    // Add all original parameters
    if (clientId) authorizeUrl.searchParams.append("client_id", clientId);
    if (redirectUri) authorizeUrl.searchParams.append("redirect_uri", redirectUri);
    if (responseType) authorizeUrl.searchParams.append("response_type", responseType);
    if (state) authorizeUrl.searchParams.append("state", state);
    if (scope) authorizeUrl.searchParams.append("scope", scope);
    
    // Add consent parameter
    authorizeUrl.searchParams.append("consent", "true");
    
    router.push(authorizeUrl.toString());
  };

  if (status === "loading" || loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (status === "unauthenticated") {
    // Redirect to login with return URL
    const returnUrl = `/consent?${searchParams.toString()}`;
    router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    return null;
  }

  if (error || !application) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error || "Invalid application"}</span>
        </div>
        <button
          onClick={() => router.push("/")}
          className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Authorization Request</h2>
          <p className="text-gray-600">
            <strong>{application.name}</strong> is requesting access to your account
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold mb-2">This application will be able to:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Access your basic profile information</li>
            {scope?.includes("email") && (
              <li>Access your email address</li>
            )}
            {scope?.includes("profile") && (
              <li>Access your profile details</li>
            )}
          </ul>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleConsent(false)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            Deny
          </button>
          <button
            onClick={() => handleConsent(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            Allow
          </button>
        </div>
      </div>
      <p className="text-center text-gray-500 text-xs">
        You can revoke access at any time from your dashboard.
      </p>
    </div>
  );
}