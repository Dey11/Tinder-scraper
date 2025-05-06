import axios from "axios";
import dotenv from "dotenv";
import { delay } from "../lib/utils";
import { getProfileById, saveProfile } from "../repository/profile.repository";
import { processAndStoreImage } from "./object-storage";
import { getEmbedding } from "./embedding";
import { storeFaceEmbedding } from "./pinecone";
import { createEmbeddingEntry } from "../repository/embedding.repository";

dotenv.config();

export async function getTinderMatches(
  locationId: string,
  jobId: string
): Promise<boolean> {
  try {
    const config = {
      method: "get",
      url: "https://api.gotinder.com/v2/recs/core?locale=en",
      headers: {
        accept: "application/json",
        origin: "https://tinder.com",
        referer: "https://tinder.com/",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "support-short-video": "1",
        "tinder-version": "6.15.0",
        "x-auth-token": process.env.TINDER_AUTH_TOKEN,
        "x-supported-image-formats": "webp,jpeg",
      },
    };

    const response = await axios(config);
    const matches = response.data.data.results;

    if (!matches || matches.length === 0) {
      console.log("No matches found");
      return false;
    }

    for (let i = 0; i < matches.length; i++) {
      const { _id, bio, birth_date, name, photos } = matches[i].user;
      const r2Urls: string[] = [];

      // cehck for multiple users
      const existingProfile = await getProfileById(_id);
      if (existingProfile) {
        continue;
      }

      // save profile to db
      await saveProfile({
        _id,
        s_number: response.data.data.results[i].s_number,
        bio,
        birth_date,
        name,
        photos: [],
        locationId,
        searchLogId: jobId,
      });

      for (let j = 0; j < photos.length; j++) {
        const photoUrl = photos[j].url;
        const fileName = `${_id}-${j}`;
        const objectUrl = await processAndStoreImage(photoUrl, fileName, _id);
        r2Urls.push(objectUrl);
        const imgEmbedding = await getEmbedding(objectUrl);

        await storeFaceEmbedding(fileName, imgEmbedding, {
          name,
          location: locationId,
          age: new Date().getFullYear() - new Date(birth_date).getFullYear(),
          imageUrl: objectUrl,
        });

        await createEmbeddingEntry(_id, fileName);
      }

      // update profile with image urls
      await saveProfile({
        _id,
        s_number: response.data.data.results[i].s_number,
        bio,
        birth_date,
        name,
        photos: r2Urls,
        locationId,
        searchLogId: jobId,
      });

      // pass/like profiles, one by one. takes 1-4s delay between each
      await passOrLikeProfile({
        _id,
        s_number: response.data.data.results[i].s_number,
      });
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function changeTinderLocation(
  lat: number,
  lon: number
): Promise<{ status: number; data: any } | null> {
  try {
    const config = {
      method: "post",
      url: "https://api.gotinder.com/v2/meta?locale=en",
      headers: {
        accept: "application/json",
        origin: "https://tinder.com",
        referer: "https://tinder.com/",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "support-short-video": "1",
        "tinder-version": "6.15.0",
        "x-auth-token": process.env.TINDER_AUTH_TOKEN,
        "x-supported-image-formats": "webp,jpeg",
      },
      data: {
        lat,
        lon,
      },
    };
    const response = await axios(config);
    return response;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function passOrLikeProfile({
  _id,
  s_number,
}: {
  _id: string;
  s_number?: string;
}) {
  try {
    await delay(Math.random() * 3000 + 1000); // Random delay between 1 and 4 seconds

    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const rand = Math.floor(Math.random() * 2);
        const passOrLike = rand ? "pass" : "like";

        const config = {
          method: "get",
          url: `https://api.gotinder.com/${passOrLike}/${_id}${
            s_number ? `?s_number=${s_number}` : ""
          }`,
          headers: {
            accept: "application/json",
            origin: "https://tinder.com",
            referer: "https://tinder.com/",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "support-short-video": "1",
            "tinder-version": "6.15.0",
            "x-auth-token": process.env.TINDER_AUTH_TOKEN,
            "x-supported-image-formats": "webp,jpeg",
          },
        };

        const response = await axios(config);

        if (response?.status === 429) {
          await delay(attempt * 2000);
          continue;
        }

        return response.data;
      } catch (err) {
        throw err;
      }
    }
  } catch (err) {
    console.error(err);
  }
}
