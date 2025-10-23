import { HfInference } from "@huggingface/inference";

const apiKey = process.env.HF_API_KEY;

const hfClient = apiKey ? new HfInference(apiKey) : null;

export async function hfSummarize(text: string, model = "facebook/bart-large-cnn") {
  if (!hfClient) {
    throw new Error("HF_API_KEY not configured. Set USE_HF=true and provide a key.");
  }

  const response = await hfClient.summarization({
    model,
    inputs: text.slice(0, 3000),
    parameters: {
      max_length: 180,
      min_length: 60,
      temperature: 0.3,
    },
  });

  return response?.summary_text ?? "";
}

export async function hfEmbed(text: string, model = "sentence-transformers/all-MiniLM-L6-v2") {
  if (!hfClient) {
    throw new Error("HF_API_KEY not configured. Set USE_HF=true and provide a key.");
  }

  const response = await hfClient.featureExtraction({
    model,
    inputs: text,
  });

  if (!Array.isArray(response)) {
    throw new Error("Unexpected Hugging Face embedding response format.");
  }

  return response;
}
