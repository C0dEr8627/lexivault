import { Client, RunTree, type RunTreeConfig } from "langsmith";

type TraceOptions = {
  name: string;
  runType?: string;
  inputs?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  tags?: string[];
};

type LangSmithRuntimeConfig = {
  apiKey?: string;
  project?: string;
  endpoint?: string;
};

function isTracingEnabled() {
  return (
    process.env.LANGSMITH_TRACING === "true" &&
    Boolean(process.env.LANGSMITH_API_KEY)
  );
}

function getProjectName() {
  return "LexiVault";
}

function getEndpoint() {
  return process.env.LANGSMITH_ENDPOINT;
}

function resolveRuntimeConfig(runtimeConfig?: LangSmithRuntimeConfig) {
  const apiKey = runtimeConfig?.apiKey || process.env.LANGSMITH_API_KEY || "";
  const projectName = runtimeConfig?.project || "LexiVault";
  const endpoint = runtimeConfig?.endpoint || process.env.LANGSMITH_ENDPOINT;

  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    projectName,
    endpoint,
  };
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown tracing error.";
}

function createRun(config: TraceOptions & { parent?: RunTree | null }, runtimeConfig?: LangSmithRuntimeConfig) {
  const resolvedRuntime = resolveRuntimeConfig(runtimeConfig);

  if (!resolvedRuntime && !isTracingEnabled()) {
    return null;
  }

  const client = resolvedRuntime
    ? new Client({
        apiKey: resolvedRuntime.apiKey,
        apiUrl: resolvedRuntime.endpoint,
      })
    : undefined;

  const runConfig: RunTreeConfig = {
    name: config.name,
    run_type: config.runType || "chain",
    project_name: resolvedRuntime?.projectName || getProjectName(),
    inputs: config.inputs ?? {},
    metadata: config.metadata,
    tags: config.tags,
    parent_run: config.parent ?? undefined,
    client,
  };

  return new RunTree(runConfig);
}

export async function withLangSmithTrace<T>(
  config: TraceOptions,
  runtimeConfig: LangSmithRuntimeConfig | undefined,
  work: (run: RunTree | null) => Promise<{ result: T; outputs?: Record<string, unknown> }>,
): Promise<T> {
  const run = createRun(config, runtimeConfig);

  if (run) {
    await run.postRun();
  }

  try {
    const { result, outputs } = await work(run);

    if (run) {
      await run.end(outputs);
      await run.patchRun();
    }

    return result;
  } catch (error) {
    if (run) {
      await run.end(undefined, toErrorMessage(error));
      await run.patchRun();
    }

    throw error;
  }
}

export async function withLangSmithChildTrace<T>(
  parent: RunTree | null,
  config: TraceOptions,
  runtimeConfig: LangSmithRuntimeConfig | undefined,
  work: (run: RunTree | null) => Promise<{ result: T; outputs?: Record<string, unknown> }>,
): Promise<T> {
  const run = createRun(
    {
      ...config,
      parent,
    },
    runtimeConfig,
  );

  if (run) {
    await run.postRun();
  }

  try {
    const { result, outputs } = await work(run);

    if (run) {
      await run.end(outputs);
      await run.patchRun();
    }

    return result;
  } catch (error) {
    if (run) {
      await run.end(undefined, toErrorMessage(error));
      await run.patchRun();
    }

    throw error;
  }
}

export function getLangSmithStatus() {
  return {
    enabled: isTracingEnabled(),
    project: getProjectName(),
    endpoint: getEndpoint() || "https://api.smith.langchain.com",
  };
}
