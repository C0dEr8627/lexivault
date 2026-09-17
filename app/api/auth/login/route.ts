import { loginWithPassword } from "@/lib/auth/auth-service";
import { errorResponse, successResponse } from "@/lib/utils/api-response";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;

  const result = await loginWithPassword(body);

  if (!result.ok) {
    return errorResponse(result.code, result.message, result.code === "UNAUTHORIZED" ? 401 : 400);
  }

  return successResponse({ authenticated: true });
}
