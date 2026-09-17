import { signupWithPassword } from "@/lib/auth/auth-service";
import { errorResponse, successResponse } from "@/lib/utils/api-response";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;

  const result = await signupWithPassword(body);

  if (!result.ok) {
    return errorResponse(result.code, result.message, result.code === "VALIDATION_ERROR" ? 400 : 500);
  }

  return successResponse({ authenticated: true }, 201);
}
