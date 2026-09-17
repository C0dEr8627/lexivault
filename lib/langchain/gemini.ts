type GeminiEmbeddingResponse = {
  embedding?: {
    values?: number[];
  };
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function getGeminiKey(apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error("Gemini API key is not configured.");
  }

  return key;
}

const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-001";
const DEFAULT_EMBEDDING_DIMENSION = 1024;

export function resolveEmbeddingModel(model?: string) {
  return DEFAULT_EMBEDDING_MODEL;
}

export async function embedText(text: string, apiKey?: string, model?: string): Promise<number[]> {
  const key = getGeminiKey(apiKey);
  const resolvedModel = resolveEmbeddingModel(model);
  const outputDimensionality = Number(process.env.GEMINI_EMBEDDING_DIMENSION || DEFAULT_EMBEDDING_DIMENSION);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(resolvedModel)}:embedContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: `models/${resolvedModel}`,
        content: {
          parts: [{ text }],
        },
        outputDimensionality,
      }),
    },
  );

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "Unable to generate embeddings.");
  }

  const data = (await response.json()) as GeminiEmbeddingResponse;
  const values = data.embedding?.values;

  if (!Array.isArray(values) || !values.length) {
    throw new Error("Gemini returned an empty embedding.");
  }

  if (values.length !== outputDimensionality) {
    throw new Error(`Gemini returned ${values.length} dimensions, expected ${outputDimensionality}.`);
  }

  return values;
}

export async function generateText(
  prompt: string,
  options: {
    apiKey?: string;
    model?: string;
    systemInstruction?: string;
  } = {},
): Promise<string> {
  const key = getGeminiKey(options.apiKey);
  const model = options.model || "gemini-2.5-flash";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: options.systemInstruction
          ? {
              parts: [{ text: options.systemInstruction }],
            }
          : undefined,
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "Unable to generate a Gemini response.");
  }

  const data = (await response.json()) as GeminiGenerateContentResponse;
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}
