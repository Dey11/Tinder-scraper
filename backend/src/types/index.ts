export interface ProfileBasic {
  name: string;
  age: number;
  tinderId: string | null;
  s_Id: string | null;
  bio: string;
}

export interface GeoLocation {
  lat: number;
  lon: number;
  name: string;
  id?: string;
}

export interface ProfileInput {
  _id: string;
  s_number?: string;
  name: string;
  birth_date: Date;
  bio: string;
  photos?: string[];
  locationId?: string;
  searchLogId?: string;
}

export interface ProfileComplete {
  name: string;
  bio: string;
  locationId: string;
  id: string;
  tinderId: string | null;
  s_Id: string | null;
  age: number;
  photoUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PineconeMatch {
  id: string;
  score: number;
  metadata?: {
    name: string;
    location: string;
    age: number;
    imageUrl: string;
  };
}
