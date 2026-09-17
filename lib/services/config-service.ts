import { createSupabaseServerClient } from "@/lib/supabase/server";
import { configSchema, EMBEDDING_MODEL, type ConfigInput } from "@/lib/validation/config-schema";
import type { ConfigRecord } from "@/types/config";
import { decryptSecretValue, encryptSecretValue } from "@/lib/utils/secrets";

type ConfigRow = {
  id: string;
  gemini_api_key: string;
  langsmith_api_key: string;
  langsmith_project: string;
  pinecone_api_key: string;
  pinecone_index_name: string;
  gemini_model: ConfigRecord["geminiModel"];
  embedding_model: ConfigRecord["embeddingModel"];
  system_prompt: string;
  created_at: string;
  updated_at: string;
};

type ConfigServiceResult =
  | { ok: true; config: ConfigRecord | null }
  | { ok: false; code: string; message: string };

type SaveConfigResult =
  | { ok: true; config: ConfigRecord }
  | { ok: false; code: string; message: string };

function mapRowToConfig(row: ConfigRow): ConfigRecord {
  return {
    id: row.id,
    geminiModel: row.gemini_model,
    embeddingModel: EMBEDDING_MODEL,
    langsmithProject: row.langsmith_project,
    pineconeIndexName: row.pinecone_index_name,
    systemPrompt: row.system_prompt,
    hasGeminiApiKey: Boolean(row.gemini_api_key),
    hasLangsmithApiKey: Boolean(row.langsmith_api_key),
    hasPineconeApiKey: Boolean(row.pinecone_api_key),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type ConfigSecretRecord = ConfigRecord & {
  geminiApiKey: string;
  langsmithApiKey: string;
  pineconeApiKey: string;
};

async function getAuthedClient() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return { supabase, user: data.user };
  } catch {
    return null;
  }
}

export async function getCurrentUserConfig(): Promise<ConfigServiceResult> {
  const session = await getAuthedClient();

  if (!session) {
    return {
      ok: false,
      code: "UNAUTHORIZED",
      message: "You must be signed in to view configuration.",
    };
  }

  const { supabase, user } = session;
  const { data, error } = await supabase
    .from("user_configs")
    .select("id, gemini_api_key, langsmith_api_key, langsmith_project, pinecone_api_key, pinecone_index_name, gemini_model, embedding_model, system_prompt, created_at, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: error.message || "Unable to load configuration.",
    };
  }

  if (!data) {
    return { ok: true, config: null };
  }

  return { ok: true, config: mapRowToConfig(data as ConfigRow) };
}

export async function getCurrentUserConfigSecrets(): Promise<
  | { ok: true; config: ConfigSecretRecord | null }
  | { ok: false; code: string; message: string }
> {
  const session = await getAuthedClient();

  if (!session) {
    return {
      ok: false,
      code: "UNAUTHORIZED",
      message: "You must be signed in to view configuration.",
    };
  }

  const { supabase, user } = session;
  const { data, error } = await supabase
    .from("user_configs")
    .select("id, gemini_api_key, langsmith_api_key, langsmith_project, pinecone_api_key, pinecone_index_name, gemini_model, embedding_model, system_prompt, created_at, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: error.message || "Unable to load configuration.",
    };
  }

  if (!data) {
    return { ok: true, config: null };
  }

  const row = data as ConfigRow;
  return {
    ok: true,
    config: {
      ...mapRowToConfig(row),
      geminiApiKey: decryptSecretValue(row.gemini_api_key),
      langsmithApiKey: decryptSecretValue(row.langsmith_api_key),
      pineconeApiKey: decryptSecretValue(row.pinecone_api_key),
    },
  };
}

export async function saveCurrentUserConfig(input: unknown): Promise<SaveConfigResult> {
  const parsed = configSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: parsed.error.issues[0]?.message || "Please complete the configuration form correctly.",
    };
  }

  const session = await getAuthedClient();

  if (!session) {
    return {
      ok: false,
      code: "UNAUTHORIZED",
      message: "You must be signed in to save configuration.",
    };
  }

  const { supabase, user } = session;
  const payload: ConfigInput = parsed.data;
  const { data: existingData, error: existingError } = await supabase
    .from("user_configs")
    .select("id, gemini_api_key, langsmith_api_key, langsmith_project, pinecone_api_key, pinecone_index_name, gemini_model, embedding_model, system_prompt, created_at, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: existingError.message || "Unable to load configuration.",
    };
  }

  const existingConfig = existingData ? mapRowToConfig(existingData as ConfigRow) : null;
  const existingSecrets = existingData
    ? {
        geminiApiKey: decryptSecretValue((existingData as ConfigRow).gemini_api_key),
        langsmithApiKey: decryptSecretValue((existingData as ConfigRow).langsmith_api_key),
        pineconeApiKey: decryptSecretValue((existingData as ConfigRow).pinecone_api_key),
      }
    : null;

  const geminiApiKey = payload.geminiApiKey.trim() || existingSecrets?.geminiApiKey || "";
  const langsmithApiKey = payload.langsmithApiKey.trim() || existingSecrets?.langsmithApiKey || "";
  const langsmithProject = payload.langsmithProject.trim() || existingConfig?.langsmithProject || "";
  const pineconeApiKey = payload.pineconeApiKey.trim() || existingSecrets?.pineconeApiKey || "";
  const pineconeIndexName = payload.pineconeIndexName.trim() || existingConfig?.pineconeIndexName || "";
  const systemPrompt = payload.systemPrompt.trim() || existingConfig?.systemPrompt || "";

  if (!geminiApiKey) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Gemini API key is required.",
    };
  }

  if (!langsmithApiKey) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "LangSmith API key is required.",
    };
  }

  if (!langsmithProject) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "LangSmith project is required.",
    };
  }

  if (!pineconeApiKey) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Pinecone API key is required.",
    };
  }

  if (!pineconeIndexName) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Pinecone index name is required.",
    };
  }

  if (systemPrompt.length < 20) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "System prompt must be at least 20 characters.",
    };
  }

  const { data, error } = await supabase
    .from("user_configs")
    .upsert(
      {
        user_id: user.id,
        gemini_api_key: encryptSecretValue(geminiApiKey),
        langsmith_api_key: encryptSecretValue(langsmithApiKey),
        langsmith_project: langsmithProject,
        pinecone_api_key: encryptSecretValue(pineconeApiKey),
        pinecone_index_name: pineconeIndexName,
        gemini_model: payload.geminiModel,
        embedding_model: EMBEDDING_MODEL,
        system_prompt: systemPrompt,
      },
      { onConflict: "user_id" },
    )
    .select("id, gemini_api_key, langsmith_api_key, langsmith_project, pinecone_api_key, pinecone_index_name, gemini_model, embedding_model, system_prompt, created_at, updated_at")
    .single();

  if (error) {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: error.message || "Unable to save configuration.",
    };
  }

  return { ok: true, config: mapRowToConfig(data as ConfigRow) };
}
