import {
  Pinecone,
  RecordMetadata,
  ScoredPineconeRecord,
} from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const indexName = "face-embeddings";
const index = pinecone.index(indexName);

async function init() {
  await pinecone.createIndex({
    name: indexName,
    dimension: 768,
    metric: "cosine",
    spec: {
      serverless: {
        cloud: "aws",
        region: "us-east-1",
      },
    },
  });
}

// init();

export async function storeFaceEmbedding(
  id: string,
  vector: number[],
  metadata: { name: string; location: string; age: number; imageUrl: string }
) {
  await index.upsert([
    {
      id,
      values: vector,
      metadata,
    },
  ]);
}

export const searchInPinecone = async (
  vector: number[],
  locationId: string
): Promise<ScoredPineconeRecord<RecordMetadata>[]> => {
  const { matches } = await index.query({
    topK: 5,
    vector,
    includeMetadata: true,
    filter: {
      location: {
        $eq: locationId,
      },
    },
  });
  return matches;
};
