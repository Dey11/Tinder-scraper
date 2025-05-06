import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

interface JobStatusProps {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  profilesScraped: number;
  error?: string | null;
  startTime: string;
}

export function JobStatus({
  status,
  profilesScraped,
  error,
  startTime,
}: JobStatusProps) {
  const progressPercentage = Math.min(
    Math.round((profilesScraped / 18) * 100),
    status === "COMPLETED" ? 100 : 95,
  );

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <StatusIndicator status={status} />
          <span className="ml-2">
            {status === "PENDING" && "Preparing Search..."}
            {status === "PROCESSING" && "Searching Profiles..."}
            {status === "COMPLETED" && "Search Complete"}
            {status === "FAILED" && "Search Failed"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-200">
              <div
                className={`h-2.5 rounded-full ${status === "FAILED" ? "bg-red-500" : "bg-gradient-to-br from-orange-700 to-orange-400"}`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="text-sm">
            <p className="text-gray-600">Profiles Scraped: {profilesScraped}</p>
            <p className="text-gray-600">
              Scraping started at: {new Date(startTime).toLocaleString()}
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">
          {status === "PROCESSING" &&
            "This search typically takes about 10 minutes to complete."}
          {status === "PENDING" && "Your search is being prepared..."}
          {status === "COMPLETED" && "Your search results are ready below."}
          {status === "FAILED" &&
            "Please try again with different search parameters."}
        </p>
      </CardFooter>
    </Card>
  );
}

function StatusIndicator({
  status,
}: {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
}) {
  if (status === "PENDING") {
    return (
      <span className="h-3 w-3 animate-pulse rounded-full bg-yellow-400"></span>
    );
  }

  if (status === "PROCESSING") {
    return (
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500"></span>
      </span>
    );
  }

  if (status === "COMPLETED") {
    return <span className="h-3 w-3 rounded-full bg-green-500"></span>;
  }

  if (status === "FAILED") {
    return <span className="h-3 w-3 rounded-full bg-red-500"></span>;
  }

  return null;
}
