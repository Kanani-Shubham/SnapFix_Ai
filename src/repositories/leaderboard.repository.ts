import { supabase } from "../lib/supabaseClient";
import { Profile } from "../types";

export const leaderboardRepository = {
  async getAllTime(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("leaderboard_all_time")
      .select("*")
      .order("points", { ascending: false });

    if (error) {
      console.error("Error fetching leaderboard_all_time view:", error);
      // Fallback to sorting profiles directly
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("profiles")
        .select("*")
        .order("points", { ascending: false })
        .limit(50);

      if (fallbackError) throw fallbackError;
      return fallbackData || [];
    }
    return data || [];
  }
};
