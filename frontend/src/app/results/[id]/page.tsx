"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { JobStatus } from "@/components/results/JobStatus";
import { ProfileCard } from "@/components/results/ProfileCard";
import { ImageMatchCard } from "@/components/results/ImageMatchCard";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  searchedName: string;
  location: string;
  profilesScraped: number;
  results: {
    nameMatches: {
      item: {
        tinderId: string;
        s_Id: string;
        name: string;
        age: number;
        bio: string;
        photoUrls: string[];
      };
      refIndex: number;
      score: number;
    }[];
    imageMatches: {
      id: string;
      score: number;
      values: any[];
      metadata: {
        age: number;
        imageUrl: string;
        location: string;
        name: string;
      };
    }[];
    error: string | null;
  };
  createdAt: string;
  error?: string | null;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null,
  );

  const jobId = params.id as string;

  const fetchResult = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/${jobId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }

      const data = await response.json();
      setResult(data);

      // Stop polling if job is completed or failed
      if (data.status === "COMPLETED" || data.status === "FAILED") {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);

      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  };

  useEffect(() => {
    fetchResult();

    // Start polling every 5 seconds
    const interval = setInterval(fetchResult, 5000);
    setPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [jobId]);

  const handleNewSearch = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-200 to-rose-200">
        <div className="flex flex-col items-center">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-rose-500" />
          <p className="text-lg text-gray-700">Loading search results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-200 to-rose-200 px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-red-600">Error</h1>
          <p className="mb-8 text-lg text-gray-700">
            {error || "Failed to load search results"}
          </p>
          <Button onClick={handleNewSearch}>Start a New Search</Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-200 to-rose-200 px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold md:text-4xl">
            {result.searchedName} in {result.location}
          </h1>
        </div>

        <JobStatus
          status={result.status}
          profilesScraped={result.profilesScraped}
          error={result.error}
          startTime={result.createdAt}
        />

        {result.status === "COMPLETED" && (
          <div className="space-y-12">
            {result.results.nameMatches &&
              result.results.nameMatches.length > 0 && (
                <div>
                  <h2 className="mb-6 text-2xl font-semibold">Name Matches</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {result.results.nameMatches.map((match) => (
                      <ProfileCard key={match.item.tinderId} profile={match} />
                    ))}
                  </div>
                </div>
              )}

            {result.results.imageMatches &&
              result.results.imageMatches.length > 0 && (
                <div>
                  <h2 className="mb-6 text-2xl font-semibold">Photo Matches</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {result.results.imageMatches.map((match) => (
                      <ImageMatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              )}

            {(!result.results.nameMatches ||
              result.results.nameMatches.length === 0) &&
              (!result.results.imageMatches ||
                result.results.imageMatches.length === 0) && (
                <div className="py-12 text-center">
                  <h2 className="mb-4 text-2xl font-semibold">
                    No Matches Found
                  </h2>
                  <p className="mx-auto max-w-lg text-gray-600">
                    We couldn't find any profiles matching your search criteria.
                    Try a different name, location or photo.
                  </p>
                  <Button
                    className="mt-6 border border-x-2 border-b-5 border-rose-800 bg-gradient-to-r from-red-500 to-pink-600 transition-all delay-50 duration-50 hover:translate-y-0.5 hover:border-x-2 hover:border-b-2 hover:bg-gradient-to-r hover:from-pink-600 hover:to-red-500"
                    onClick={handleNewSearch}
                  >
                    Start a New Search
                  </Button>
                </div>
              )}
          </div>
        )}
      </div>
    </main>
  );
}
