import { prisma } from "../lib/prisma";

export async function createEmbeddingEntry(
  tinderId: string,
  vectorId: string
): Promise<void> {
  try {
    await prisma.embedding.create({
      data: {
        tinderId,
        vectorId,
      },
    });
  } catch (error) {
    console.error("Error creating embedding entry:", error);
    throw error;
  }
}
