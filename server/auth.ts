import type { NextApiRequest } from "next";
import { supabaseAdmin } from "./supabaseAdmin";

export interface AuthContext {
  userId: string;
  email?: string;
}

export async function requireUser(req: NextApiRequest): Promise<AuthContext> {
  const authHeader = req.headers.authorization;
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
