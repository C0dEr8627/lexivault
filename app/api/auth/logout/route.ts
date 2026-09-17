import { signOutUser } from "@/lib/auth/auth-service";
import { errorResponse, successResponse } from "@/lib/utils/api-response";

export async function POST() {
  const result = await signOutUser();

  if (!result.ok) {
    return errorResponse(result.code, result.message, 500);
  }

  return successResponse({ signedOut: true });
}
