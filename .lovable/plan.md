

# Fix: Student Creation Edge Function

## Problem
The `create-student` edge function returns HTTP 400 on errors. The Supabase JS SDK's `functions.invoke()` discards response bodies for non-2xx responses, so the frontend gets a generic "FunctionsHttpError" instead of the real error message. Additionally, the CORS headers are incomplete (missing SDK platform headers), and the function references `SUPABASE_PUBLISHABLE_KEY` which may not resolve correctly.

## Changes

### 1. Fix the edge function (`supabase/functions/create-student/index.ts`)
- **Always return 200** with `ok: true/false` in the JSON body (per the stack-overflow pattern)
- Update CORS headers to include all Supabase SDK headers (`x-supabase-client-platform`, etc.)
- Use `SUPABASE_ANON_KEY` instead of `SUPABASE_PUBLISHABLE_KEY` for the user client (matches the actual secret name)

### 2. Update the Dashboard handler (`src/pages/Dashboard.tsx`)
- Adjust error checking: read `res.data.ok === false` and `res.data.error` since the function now always returns 200
- Remove `res.error` check (won't trigger with 200 responses)

### Technical Detail

```text
Before:  function returns 400 → SDK strips body → client sees "FunctionsHttpError"
After:   function returns 200 + {ok:false, error:"..."} → client reads real error
```

The edge function will also be redeployed automatically after the code change.

