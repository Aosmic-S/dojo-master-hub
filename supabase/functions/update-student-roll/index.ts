import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const SYNTHETIC_DOMAIN = "students.bjka.local";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ ok: false, error: "No authorization header" });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await userClient.auth.getUser();
    if (!caller) return json({ ok: false, error: "Unauthorized" });

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: roleCheck } = await adminClient
      .from("user_roles").select("role").eq("user_id", caller.id).eq("role", "admin").maybeSingle();
    if (!roleCheck) return json({ ok: false, error: "Not an admin" });

    const { user_id, new_roll } = await req.json();
    if (!user_id || !new_roll) return json({ ok: false, error: "Missing fields" });

    const normalized = String(new_roll).trim().toUpperCase();
    const newEmail = `${normalized.toLowerCase()}@${SYNTHETIC_DOMAIN}`;

    const { error } = await adminClient.auth.admin.updateUserById(user_id, { email: newEmail });
    if (error) return json({ ok: false, error: error.message });

    return json({ ok: true });
  } catch (err: any) {
    return json({ ok: false, error: err.message });
  }
});
