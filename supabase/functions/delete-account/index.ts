import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw userError;
    const user = userData.user;
    if (!user?.email) throw new Error("User not found");

    // Get password from request body
    const { password } = await req.json();
    if (!password) throw new Error("Password is required");

    // Verify password by attempting to sign in
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: user.email,
      password: password,
    });

    if (signInError) {
      return new Response(
        JSON.stringify({ error: "Incorrect password" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Password is correct, proceed with account deletion
    console.log(`Starting complete account deletion for user ${user.id}`);

    // Delete user data from all tables (order matters for foreign key constraints)
    const tables = [
      "trades",
      "journal_entries",
      "daily_prep",
      "assistant_conversations",
      "ninjatrader_executions",
      "news_source_preferences",
      "user_achievements",
    ];

    for (const table of tables) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq("user_id", user.id);
      
      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        // Continue with other deletions
      } else {
        console.log(`Deleted data from ${table}`);
      }
    }

    // Delete user_settings
    const { error: settingsError } = await supabaseAdmin
      .from("user_settings")
      .delete()
      .eq("user_id", user.id);
    
    if (settingsError) {
      console.error("Error deleting user_settings:", settingsError);
    } else {
      console.log("Deleted user_settings");
    }

    // Delete profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", user.id);
    
    if (profileError) {
      console.error("Error deleting profile:", profileError);
    } else {
      console.log("Deleted profile");
    }

    // Delete user's storage files
    try {
      const { data: files } = await supabaseAdmin.storage
        .from("trade-screenshots")
        .list(user.id);
      
      if (files && files.length > 0) {
        const filePaths = files.map(f => `${user.id}/${f.name}`);
        await supabaseAdmin.storage
          .from("trade-screenshots")
          .remove(filePaths);
        console.log(`Deleted ${files.length} storage files`);
      }
    } catch (storageError) {
      console.error("Error deleting storage files:", storageError);
    }

    // Finally, delete the auth user
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError);
      throw new Error("Failed to delete user account");
    }

    console.log(`Successfully deleted account for user ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in delete-account:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
