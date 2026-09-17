import { getLangSmithStatus } from "@/lib/observability/langsmith";
import { successResponse } from "@/lib/utils/api-response";

export async function GET() {
  return successResponse({
    status: "ok",
    app: "LexiVault",
    version: "1.0.0",
    tracing: getLangSmithStatus(),
  });
}
