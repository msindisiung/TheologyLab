# TheologyLab UI layer

Three-pane Next.js workspace connected to the TheologyLab Supabase project.

Set:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

The workspace uses:
- `workspace_snapshot()` for project context
- Supabase tables for claims/notes
- `research-assistant` Edge Function for AI
- Supabase Auth for the current user

Run `npm install && npm run dev`.


## RAG update

The Research Assistant invokes `research-assistant-rag` with the active
`project_id`, question, mode, and project context. Retrieved source chunks are
displayed in the assistant pane with evidence references, page numbers, and
similarity scores.


## Build fix

The Supabase browser client is now created lazily with `getSupabase()` rather
than at module evaluation time. This prevents Next.js/Vercel prerendering from
failing the `/` page when the client module is evaluated during the build.
The required public environment variables are still required at runtime:
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
Deployment trigger
Supabase key deployment trigger
