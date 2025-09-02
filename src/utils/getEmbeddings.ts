import { VOYAGE_API_KEY } from "../config.ts"
import { VoyageAIClient } from 'voyageai';

// Set up Voyage AI configuration
const client = new VoyageAIClient({apiKey: VOYAGE_API_KEY});
// Function to generate embeddings using the Voyage AI API
export async function getEmbedding(text: string) {
    const results = await client.embed({
        input: text,
        model: "voyage-3-large"
    });
    if (!results.data || results.data.length === 0) {
        throw new Error("No embedding data returned from Voyage AI API.");
    }
    return results.data[0].embedding;
}
