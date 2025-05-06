import Replicate from "replicate";
import dotenv from "dotenv";

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function getEmbedding(imageUrl: string): Promise<number[]> {
  const input = {
    inputs: imageUrl,
  };
  // @ts-ignore
  const output: {
    embedding: number[];
    input: string;
  }[] = await replicate.run(
    "andreasjansson/clip-features:75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a", // replicate model name
    { input }
  );

  return output[0].embedding;
}
