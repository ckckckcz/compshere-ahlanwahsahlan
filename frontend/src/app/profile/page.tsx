"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSummary } from "@/components/widget/Profile/profile-summary";
import { InfoCard } from "@/components/widget/Profile/info-card";

interface UserData {
  id: string;
  avatar?: string;
  name: string;
  email: string;
  phone: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (typeof window === "undefined") {
          setError("Not in browser environment");
          return;
        }

        const sessionData = localStorage.getItem("session_id");
        console.log("Raw session data from localStorage:", sessionData);

        if (!sessionData) {
          setError("No session found");
          return;
        }
        let userId = sessionData.replace("user_", "");

        console.log("Session data:", sessionData);
        console.log("Extracted user ID:", userId);

        if (!userId) {
          setError("Invalid session data");
          return;
        }

        const apiUrl = `https://coherent-classic-platypus.ngrok-free.app/get/user/${userId}`;
        console.log("Fetching from URL:", apiUrl);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
              Accept: "application/json",
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          console.log("Response status:", response.status);
          console.log("Response headers:", Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Response:", errorText);

            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { error: errorText };
            }

            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          console.log("API Response:", result);

          if (!result || !result.data) {
            console.error("Invalid response structure:", result);
            throw new Error("Invalid response format from API");
          }

          const data = result.data;
          console.log("User data from API:", data);

          const transformedData: UserData = {
            id: data.id || "",
            avatar: data.foto,
            name: data.nama_keluarga || "Unknown User",
            email: data.email || "",
            phone: data.phone || "Not provided",
          };

          console.log("Transformed data:", transformedData);
          setUserData(transformedData);
        } catch (fetchError) {
          clearTimeout(timeoutId);

          if (typeof fetchError === "object" && fetchError !== null && "name" in fetchError && (fetchError as { name?: string }).name === "AbortError") {
            throw new Error("Request timeout - please check your internet connection");
          }
          if (fetchError instanceof TypeError && fetchError.message.includes("fetch")) {
            throw new Error("Network error - unable to connect to server. Please check if the server is running.");
          }

          throw fetchError;
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        let errorMessage = "An error occurred";
        if (err instanceof Error) {
          errorMessage = err.message;
        }

        if (errorMessage.includes("NetworkError") || errorMessage.includes("fetch")) {
          errorMessage += "\n\nPossible solutions:\n1. Check if the backend server is running\n2. Verify the ngrok URL is correct\n3. Check your internet connection";
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-4 md:p-6 space-y-4 md:space-y-6">
        <div>Loading...</div>
      </main>
    );
  }

  if (error || !userData) {
    return (
      <main className="mx-auto max-w-6xl p-4 md:p-6 space-y-4 md:space-y-6">
        <div>Error: {error || "No user data found"}</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6 space-y-4 md:space-y-6">
      <img src="/images/user-profile-reference.png" alt="Reference design for staff profile" className="sr-only" />

      <Tabs defaultValue="profile" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="min-w-max">
            <TabsTrigger value="profile">User Personal</TabsTrigger>
            <TabsTrigger value="work">Family Data</TabsTrigger>
            <TabsTrigger value="timesheet">Riwayat Pemesanan</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="space-y-4 md:space-y-6">
          <ProfileSummary userData={userData} />
          <InfoCard
            title="Personal information"
            items={[
              { label: "Name", value: userData.name },
              { label: "Email", value: userData.email },
              { label: "Nomor Telephone", value: userData.phone }
            ]}
          />
        </TabsContent>

        <TabsContent value="work">
          <Placeholder title="Work information" />
        </TabsContent>
        <TabsContent value="timesheet">
          <Placeholder title="Timesheet & Attendance" />
        </TabsContent>
        <TabsContent value="contracts">
          <Placeholder title="Contracts & Documents" />
        </TabsContent>
        <TabsContent value="payroll">
          <Placeholder title="Payroll & Benefits" />
        </TabsContent>
        <TabsContent value="assets">
          <Placeholder title="Company assets" />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function Placeholder({ title }: { title: string }) {
  return <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">{title} content goes here.</div>;
}
