import { supabase } from "../lib/supabaseClient";
import { Badge, UserBadge } from "../types";

export const badgesRepository = {
  async getAll(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from("badges")
      .select("*");

    if (error) {
      console.error("Error fetching badges:", error);
      throw error;
    }
    return (data || []).map((b: any) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      icon_name: b.icon_url || "Award",
      criteria: b.criteria || "",
      unlocked: false
    }));
  },

  async getByProfileId(profileId: string): Promise<UserBadge[]> {
    const { data, error } = await supabase
      .from("user_badges")
      .select("*")
      .eq("profile_id", profileId);

    if (error) {
      console.error("Error fetching user badges:", error);
      throw error;
    }
    return (data || []).map((ub: any) => ({
      id: ub.id,
      profile_id: ub.profile_id,
      badge_id: ub.badge_id,
      earned_at: ub.earned_at
    }));
  },

  async earnBadge(profileId: string, badgeId: string): Promise<UserBadge> {
    const { data, error } = await supabase
      .from("user_badges")
      .insert({
        profile_id: profileId,
        badge_id: badgeId
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error earning badge:", error);
      throw error;
    }
    return {
      id: data.id,
      profile_id: data.profile_id,
      badge_id: data.badge_id,
      earned_at: data.earned_at
    };
  }
};
