"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface SearchFormValues {
  name: string;
  age: string;
  location: string;
  photo: string;
}

export function SearchForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<SearchFormValues>({
    name: "",
    age: "",
    location: "",
    photo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!values.name || !values.location || !values.photo || !values.age) {
        throw new Error("Name, location, photo, and age are required");
      }

      // Make API call to backend
      const response = await fetch("http://localhost:3000/api/v1/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          age: parseInt(values.age),
          location: values.location,
          photos: [values.photo],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to start search");
      }

      const data = await response.json();

      // Redirect to results page with the job ID
      router.push(`/results/${data.jobId}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter a name to search"
            value={values.name}
            onChange={handleChange}
            required
            className="border-rose-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            name="age"
            type="number"
            placeholder="Age"
            value={values.age}
            onChange={handleChange}
            min={18}
            max={100}
            className="border-rose-200"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="City, Country"
            value={values.location}
            onChange={handleChange}
            required
            className="border-rose-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo">Photo URL</Label>
          <Input
            id="photo"
            name="photo"
            placeholder="http://example.com/photo.jpg"
            value={values.photo}
            onChange={handleChange}
            required
            className="border-rose-200"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full border border-x-2 border-b-5 border-rose-800 bg-gradient-to-r from-red-500 to-pink-600 transition-all delay-50 duration-50 hover:translate-y-0.5 hover:border-x-2 hover:border-b-2 hover:bg-gradient-to-r hover:from-pink-600 hover:to-red-500"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Start Search
      </Button>
    </form>
  );
}
