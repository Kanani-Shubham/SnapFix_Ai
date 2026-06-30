import { supabase } from "../lib/supabaseClient";
import { Profile } from "../types";

export const profilesRepository = {
  async getByFirebaseUid(uid: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("firebase_uid", uid)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile by firebase_uid:", error);
      throw error;
    }
    return data;
  },

  async create(profile: Omit<Profile, "id" | "created_at">): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        firebase_uid: profile.firebase_uid,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        role: profile.role,
        points: profile.points,
        level: profile.level
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
    return data;
  },

  async update(id: string, updates: Partial<Omit<Profile, "id" | "created_at">>): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
    return data;
  }
};
