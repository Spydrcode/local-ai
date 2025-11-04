/**
 * Supabase-based rate limiter (no Redis needed)
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function rateLimit(
  key: string,
  limit = 10,
  windowSeconds = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowSeconds * 1000)

  // Count requests in current window
  const { count } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('key', key)
    .gte('created_at', windowStart.toISOString())

  const currentCount = count || 0

  if (currentCount >= limit) {
    return { allowed: false, remaining: 0 }
  }

  // Log this request
  await supabase
    .from('rate_limits')
    .insert({ key, created_at: now.toISOString() })

  return { allowed: true, remaining: limit - currentCount - 1 }
}