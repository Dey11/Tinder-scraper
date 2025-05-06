import React from "react";
import { Card, CardContent } from "@/components/ui/Card";

interface ImageMatch {
  id: string;
  score: number;
  values: any[];
  metadata: {
    age: number;
    imageUrl: string;
    location: string;
    name: string;
  };
}

interface ImageMatchCardProps {
  match: ImageMatch;
}

export function ImageMatchCard({ match }: ImageMatchCardProps) {
  const matchPercentage = Math.round(match.score * 100);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative h-80">
        <img
          src={match.metadata.imageUrl}
          alt={`${match.metadata.name}'s photo`}
          className="h-full w-full object-cover"
          loading="lazy"
        />

        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                {match.metadata.name}, {match.metadata.age}
              </h3>
            </div>
            <div className="rounded-full bg-rose-500 px-2 py-1 text-xs font-bold text-white">
              {matchPercentage}% Similar
            </div>
          </div>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col">
        <div className="mt-2 flex-1">
          <p className="text-sm">Visual match based on provided photo</p>
        </div>

        <div className="mt-4 border-t pt-4 text-xs text-gray-500">
          <p>Image ID: {match.id.substring(0, 10)}...</p>
        </div>
      </CardContent>
    </Card>
  );
}
