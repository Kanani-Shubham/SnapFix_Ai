import { supabase } from "../lib/supabaseClient";
import { Story } from "../types";

export const storiesRepository = {
  async getActive(): Promise<Story[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("stories")
      .select(`
        *,
        profiles:author_id (
          name,
          avatar_url
        )
      `)
      .gt("expires_at", now)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching active stories:", error);
      throw error;
    }

    return (data || []).map((s: any) => ({
      id: s.id,
      profile_id: s.author_id,
      profile_name: s.profiles?.name || "Unknown Citizen",
      profile_avatar: s.profiles?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      media_url: s.media_url,
      expires_at: s.expires_at,
      created_at: s.created_at,
      category: s.category,
      views_count: s.views_count || 0
    }));
  },

  async create(story: Omit<Story, "id" | "profile_name" | "profile_avatar" | "created_at" | "views_count">): Promise<Story> {
    const { data, error } = await supabase
      .from("stories")
      .insert({
        author_id: story.profile_id,
        media_url: story.media_url,
        category: story.category,
        expires_at: story.expires_at
      })
      .select(`
        *,
        profiles:author_id (
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error("Error creating story:", error);
      throw error;
    }

    return {
      id: data.id,
      profile_id: data.author_id,
      profile_name: data.profiles?.name || "Unknown Citizen",
      profile_avatar: data.profiles?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      media_url: data.media_url,
      expires_at: data.expires_at,
      created_at: data.created_at,
      category: data.category,
      views_count: data.views_count || 0
    };
  }
};
