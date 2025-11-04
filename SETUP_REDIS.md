# Setup Upstash Redis for Rate Limiting

## Quick Setup (5 minutes)

### 1. Create Free Upstash Account
Visit: https://upstash.com

### 2. Create Redis Database
1. Click "Create Database"
2. Name: `local-ai-ratelimit`
3. Type: Regional
4. Region: Choose closest to you
5. Click "Create"

### 3. Get Credentials
After creation, you'll see:
- **UPSTASH_REDIS_REST_URL** - Copy this
- **UPSTASH_REDIS_REST_TOKEN** - Copy this

### 4. Add to .env.local
```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXabc...your-token
```

### 5. Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## ✅ Verify It Works

Try the quick-analyze endpoint:
```bash
curl -X POST http://localhost:3000/api/quick-analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

You should see rate limiting in action after 10 requests in 60 seconds.

## Free Tier Limits

- 10,000 commands/day
- 256 MB storage
- Perfect for development and small production apps

## Production Deployment

For Vercel deployment, add the same environment variables in:
**Vercel Dashboard → Your Project → Settings → Environment Variables**

## Optional: Test Redis Connection

```typescript
// test-redis.ts
import { redis } from './lib/redis'

async function test() {
  await redis.set('test', 'hello')
  const value = await redis.get('test')
  console.log('Redis works:', value)
}

test()
```
