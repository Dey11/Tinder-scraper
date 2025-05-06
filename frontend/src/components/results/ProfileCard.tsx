import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { MoveLeft, MoveRight } from "lucide-react";

interface ProfileMatch {
  item: {
    tinderId: string;
    s_Id: string;
    name: string;
    age: number;
    bio: string;
    photoUrls: string[];
  };
  score: number;
  refIndex: number;
}

interface ProfileCardProps {
  profile: ProfileMatch;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const { item } = profile;

  const nextPhoto = () => {
    setActivePhotoIndex((prev) =>
      prev === item.photoUrls.length - 1 ? 0 : prev + 1,
    );
  };

  const prevPhoto = () => {
    setActivePhotoIndex((prev) =>
      prev === 0 ? item.photoUrls.length - 1 : prev - 1,
    );
  };

  const matchScore =
    profile.score === 0 ? 100 : Math.round((1 - Math.abs(profile.score)) * 100);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="group relative h-96">
        <img
          src={item.photoUrls[activePhotoIndex]}
          alt={`${item.name}'s photo ${activePhotoIndex + 1}`}
          className="h-full w-full object-cover transition-opacity"
          loading="lazy"
        />

        {item.photoUrls.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/50"
              aria-label="Previous photo"
            >
              <MoveLeft className="size-3" />
            </button>

            <button
              onClick={nextPhoto}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/50"
              aria-label="Next photo"
            >
              <MoveRight className="size-3" />
            </button>
          </>
        )}

        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                {item.name}, {item.age}
              </h3>
            </div>
            <div className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
              {matchScore}% Match
            </div>
          </div>
        </div>

        {item.photoUrls.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-1">
            {item.photoUrls.map((_, index) => (
              <button
                key={index}
                onClick={() => setActivePhotoIndex(index)}
                className={`h-2 w-2 rounded-full ${
                  index === activePhotoIndex ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col">
        <p className="mt-2 flex-1 text-sm">{item.bio || "No bio available"}</p>

        <div className="mt-4 border-t pt-4 text-xs text-gray-500">
          <p>Profile ID: {item.tinderId}</p>
        </div>
      </CardContent>
    </Card>
  );
}
