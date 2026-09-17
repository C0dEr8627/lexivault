import {
  createCurrentUserChatSession,
  listCurrentUserChatSessions,
} from "@/lib/services/chat-service";
import { errorResponse, successResponse } from "@/lib/utils/api-response";

export async function GET() {
  const result = await listCurrentUserChatSessions();

  if (!result.ok) {
    return errorResponse(result.code, result.message, result.code === "UNAUTHORIZED" ? 401 : 500);
  }

  return successResponse(result.data);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;
  const result = await createCurrentUserChatSession(body);

  if (!result.ok) {
    return errorResponse(result.code, result.message, result.code === "VALIDATION_ERROR" ? 400 : 500);
  }

  return successResponse(result.data, 201);
}
