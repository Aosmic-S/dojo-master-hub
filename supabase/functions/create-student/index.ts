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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ ok: false, error: "No authorization header" });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await userClient.auth.getUser();
    if (!caller) return json({ ok: false, error: "Unauthorized" });

    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: roleCheck } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleCheck) return json({ ok: false, error: "Not an admin" });

    const body = await req.json();
    const { email, password, full_name, belt_level, date_of_birth, date_of_joining, father_name, weight_kg, contact_number } = body;

    // Create auth user
    const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authErr) return json({ ok: false, error: authErr.message });

    const userId = authData.user.id;

    // Insert student record
    const { error: studentErr } = await adminClient.from("students").insert({
      user_id: userId,
      full_name,
      belt_level: belt_level || "White",
      date_of_birth: date_of_birth || null,
      date_of_joining: date_of_joining || new Date().toISOString().split("T")[0],
      father_name: father_name || null,
      weight_kg: weight_kg ? parseFloat(weight_kg) : null,
      contact_number: contact_number || null,
    });
    if (studentErr) return json({ ok: false, error: studentErr.message });

    // Add student role
    const { error: roleErr } = await adminClient.from("user_roles").insert({
      user_id: userId,
      role: "student",
    });
    if (roleErr) return json({ ok: false, error: roleErr.message });

    return json({ ok: true, user_id: userId });
  } catch (err: any) {
    return json({ ok: false, error: err.message });
  }
});
