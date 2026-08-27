# TheologyLab — functional validation build

Implemented:
- Supabase authentication
- Research project creation/listing
- Project workspace snapshot
- Source ingestion from pasted text
- Chunking and embedding queue
- Embedding worker invocation
- RAG research assistant
- Retrieved evidence display
- RLS-based isolation

Vercel variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Supabase Edge Function secret required for AI:
- OPENAI_API_KEY


Browser compatibility fix:
- Source ingestion now uses a secured database RPC.
- AI Edge Function calls are proxied through `/api/edge`, avoiding browser CORS/network issues.
