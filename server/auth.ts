import type { NextApiRequest } from "next";
import { headers } from "next/headers";
import { supabaseAdmin } from "./supabaseAdmin";

export interface AuthContext {
  userId: string;
  email?: string;
}

/**
 * Require user authentication for API routes
 * Supports both Pages API (NextApiRequest) and App Router (no param - uses headers())
 */
export async function requireUser(req?: NextApiRequest): Promise<AuthContext> {
  let authHeader: string | undefined;

  // App Router (Next.js 13+) - use headers() from next/headers
  if (!req) {
    const headersList = await headers();
    authHeader = headersList.get("authorization") || undefined;
  }
  // Pages API - use req.headers
  else {
    authHeader = req.headers.authorization;
  }

  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token) {
    throw new Error("Unauthorized: missing bearer token");
  }

  if (!supabaseAdmin) {
    throw new Error("Supabase admin client is not configured.");
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    throw new Error("Unauthorized: invalid token");
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? undefined,
  };
}
