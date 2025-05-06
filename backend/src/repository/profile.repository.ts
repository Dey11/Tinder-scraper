import { prisma } from "../lib/prisma";
import { ProfileBasic, ProfileComplete, ProfileInput } from "../types";

export async function saveProfile(
  profile: ProfileInput
): Promise<ProfileComplete> {
  try {
    const { _id, s_number, name, birth_date, bio, photos, locationId } =
      profile;

    const savedProfile = await prisma.profile.upsert({
      where: { tinderId: _id },
      update: {
        s_Id: s_number?.toString() || null,
        name,
        age: new Date().getFullYear() - new Date(birth_date).getFullYear(),
        bio,
        photoUrls: photos || [],
        locationId: locationId!,
        searchLogId: profile.searchLogId,
      },
      create: {
        tinderId: _id,
        s_Id: s_number?.toString() || null,
        name,
        age: new Date().getFullYear() - new Date(birth_date).getFullYear(),
        bio,
        locationId: locationId!,
        photoUrls: photos || [],
      },
    });
    return savedProfile;
  } catch (error) {
    console.error("Error saving profile:", error);
    throw error;
  }
}

export async function getAllProfilesByLocation(
  locationId: string
): Promise<ProfileBasic[]> {
  try {
    const profiles = await prisma.profile.findMany({
      where: { locationId },
      select: {
        tinderId: true,
        s_Id: true,
        name: true,
        age: true,
        bio: true,
        photoUrls: true,
      },
    });
    return profiles;
  } catch (error) {
    console.error("Error fetching all profiles:", error);
    throw error;
  }
}

export async function getProfileById(id: string): Promise<boolean> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { tinderId: id },
    });

    return !!profile;
  } catch (error) {
    console.error("Error fetching profile by ID:", error);
    throw error;
  }
}
