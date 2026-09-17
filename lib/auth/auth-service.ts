import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validation/auth-schema";

export type AuthResult =
  | { ok: true }
  | {
      ok: false;
      code: string;
      message: string;
    };

export async function loginWithPassword(input: unknown): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Please enter a valid email and password.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      code: "SUPABASE_ERROR",
      message: "Supabase environment variables are not configured.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      ok: false,
      code: "UNAUTHORIZED",
      message: error.message || "Unable to sign in.",
    };
  }

  return { ok: true };
}

export async function signupWithPassword(input: unknown): Promise<AuthResult> {
  const parsed = signupSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Please complete the signup form correctly.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      code: "SUPABASE_ERROR",
      message: "Supabase environment variables are not configured.",
    };
  }

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      ok: false,
      code: "SUPABASE_ERROR",
      message: error.message || "Unable to create account.",
    };
  }

  return { ok: true };
}

export async function signOutUser(): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      code: "SUPABASE_ERROR",
      message: "Supabase environment variables are not configured.",
    };
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      ok: false,
      code: "SUPABASE_ERROR",
      message: error.message || "Unable to sign out.",
    };
  }

  return { ok: true };
}
