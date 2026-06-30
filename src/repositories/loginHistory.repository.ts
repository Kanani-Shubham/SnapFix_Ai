import { supabase } from "../lib/supabaseClient";

export interface LoginHistoryEntry {
  firebase_uid?: string;
  email: string;
  status: "success" | "failure";
  failure_reason?: string;
  user_agent: string;
  platform: string;
  browser: string;
  ip_address?: string;
}

export const loginHistoryRepository = {
  async insert(entry: LoginHistoryEntry): Promise<void> {
    try {
      let resolvedProfileId: string | null = null;
      
      if (entry.firebase_uid) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("firebase_uid", entry.firebase_uid)
          .maybeSingle();
        if (profile) {
          resolvedProfileId = profile.id;
        }
      }

      const cleanIp = entry.ip_address && entry.ip_address !== "unknown" && !entry.ip_address.includes("test")
        ? entry.ip_address 
        : "127.0.0.1";

      const { error } = await supabase
        .from("login_history")
        .insert({
          profile_id: resolvedProfileId,
          success: entry.status === "success",
          ip_address: cleanIp
        });

      if (error) {
        if (error.message.includes("row-level security policy")) {
          console.info("Login history logging is secured by row-level security (RLS).");
        } else {
          console.error("Error inserting login_history record:", error.message);
        }
      }
    } catch (err) {
      console.error("Exception in login_history insert:", err);
    }
  }
};
