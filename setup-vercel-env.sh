#!/bin/bash
# Setup Vercel Environment Variables
# Run this with: vercel env add

echo "Setting up Vercel environment variables..."

# Core Supabase variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development
vercel env add SUPABASE_ANON_KEY production preview development

# AI Provider
vercel env add OPENAI_API_KEY production preview development
vercel env add AI_PROVIDER production preview development

# Vector Database
vercel env add PINECONE_API_KEY production preview development
vercel env add PINECONE_INDEX_NAME production preview development

# Meta Ads (optional)
vercel env add META_ADS_LIBRARY_TOKEN production preview development

echo "Done! Now redeploy your application on Vercel."
