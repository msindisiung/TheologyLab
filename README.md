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
