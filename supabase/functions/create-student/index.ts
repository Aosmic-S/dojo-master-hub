import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await userClient.auth.getUser();
    if (!caller) throw new Error("Unauthorized");

    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: roleCheck } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleCheck) throw new Error("Not an admin");

    const body = await req.json();
    const { email, password, full_name, belt_level, date_of_birth, date_of_joining, father_name, weight_kg, contact_number } = body;

    // Create auth user
    const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authErr) throw authErr;

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
    if (studentErr) throw studentErr;

    // Add student role
    const { error: roleErr } = await adminClient.from("user_roles").insert({
      user_id: userId,
      role: "student",
    });
    if (roleErr) throw roleErr;

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
