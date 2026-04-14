import { supabase } from "@/integrations/supabase/client";

// Run this once to create admin account
export const createAdminAccount = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: "admin@rajajanakacademy.com",
    password: "admin@rja2024",
  });
  
  if (error) {
    console.error("Admin signup error:", error);
    return;
  }

  if (data.user) {
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: data.user.id,
      role: "admin" as const,
    });
    if (roleError) console.error("Role insert error:", roleError);
    else console.log("Admin account created successfully!");
  }
};
