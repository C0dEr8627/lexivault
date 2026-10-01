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

async function getGeminiErrorMessage(response: Response, fallback: string) {
  const body = await response.text().catch(() => "");

  if (!body) {
    return fallback;
  }

  try {
    const payload = JSON.parse(body) as {
      error?: { code?: number; message?: string; status?: string };
    };
    const apiError = payload.error;

    if (!apiError) {
      return body;
    }

    if (apiError.code === 403 || apiError.status === "PERMISSION_DENIED") {
      const details = apiError.message || "The configured Google Cloud project was denied access.";
      return `Gemini API access denied (${apiError.code ?? response.status} ${apiError.status ?? "PERMISSION_DENIED"}): ${details} Check the configured API key's project access in Google AI Studio or Google Cloud Console. If Google has restricted the project, follow its support instructions.`;
    }

    return apiError.message
      ? `Gemini API request failed (${apiError.code ?? response.status}${apiError.status ? ` ${apiError.status}` : ""}): ${apiError.message}`
      : body;
  } catch {
    return body;
  }
}

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
    throw new Error(await getGeminiErrorMessage(response, "Unable to generate embeddings."));
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
  const model = options.model || "gemini-3.8-flash";

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
    throw new Error(await getGeminiErrorMessage(response, "Unable to generate a Gemini response."));
  }

  const data = (await response.json()) as GeminiGenerateContentResponse;
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}
