import { supabase } from "../lib/supabaseClient";
import { Comment } from "../types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUuid(id: string, name: string) {
  if (!id) {
    throw new Error(`Validation Error: ${name} is required.`);
  }
  if (!UUID_REGEX.test(id)) {
    throw new Error(`Validation Error: Invalid UUID format for ${name} ("${id}").`);
  }
}

export const commentsRepository = {
  async getAll(): Promise<Comment[]> {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:author_id (
          name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching all comments:", error);
      return [];
    }

    return (data || []).map((c: any) => ({
      id: c.id,
      report_id: c.report_id,
      profile_id: c.author_id,
      profile_name: c.profiles?.name || "Unknown Citizen",
      profile_avatar: c.profiles?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      content: c.content,
      parent_comment_id: c.parent_comment_id,
      is_pinned: c.is_pinned || false,
      is_ai_moderated: c.is_ai_moderated || false,
      created_at: c.created_at,
      likes_count: c.likes_count || 0
    }));
  },

  async getByReportId(reportId: string): Promise<Comment[]> {
    validateUuid(reportId, "Report ID");

    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:author_id (
          name,
          avatar_url
        )
      `)
      .eq("report_id", reportId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }

    return (data || []).map((c: any) => ({
      id: c.id,
      report_id: c.report_id,
      profile_id: c.author_id,
      profile_name: c.profiles?.name || "Unknown Citizen",
      profile_avatar: c.profiles?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      content: c.content,
      parent_comment_id: c.parent_comment_id,
      is_pinned: c.is_pinned || false,
      is_ai_moderated: c.is_ai_moderated || false,
      created_at: c.created_at,
      likes_count: c.likes_count || 0,
      has_liked: false // can be toggled by active profile session checks
    }));
  },

  async create(comment: Omit<Comment, "id" | "profile_name" | "profile_avatar" | "created_at" | "likes_count" | "is_pinned" | "is_ai_moderated">): Promise<Comment> {
    validateUuid(comment.report_id, "Report ID");
    validateUuid(comment.profile_id, "Author/Profile ID");
    
    if (!comment.content || !comment.content.trim()) {
      throw new Error("Validation Error: Comment content cannot be empty.");
    }
    if (comment.parent_comment_id) {
      validateUuid(comment.parent_comment_id, "Parent Comment ID");
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        report_id: comment.report_id,
        author_id: comment.profile_id,
        content: comment.content.trim(),
        parent_comment_id: comment.parent_comment_id
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
      console.error("Error creating comment:", error);
      throw error;
    }

    return {
      id: data.id,
      report_id: data.report_id,
      profile_id: data.author_id,
      profile_name: data.profiles?.name || "Unknown Citizen",
      profile_avatar: data.profiles?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      content: data.content,
      parent_comment_id: data.parent_comment_id,
      is_pinned: data.is_pinned || false,
      is_ai_moderated: data.is_ai_moderated || false,
      created_at: data.created_at,
      likes_count: data.likes_count || 0
    };
  },

  async delete(commentId: string): Promise<void> {
    validateUuid(commentId, "Comment ID");

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    if (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  async update(commentId: string, content: string): Promise<void> {
    validateUuid(commentId, "Comment ID");
    if (!content || !content.trim()) {
      throw new Error("Validation Error: Comment content cannot be empty.");
    }

    const { error } = await supabase
      .from("comments")
      .update({ content: content.trim(), updated_at: new Date().toISOString() })
      .eq("id", commentId);
    if (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  },

  async toggleLike(commentId: string, increment: boolean): Promise<number> {
    validateUuid(commentId, "Comment ID");

    const { data, error: fetchErr } = await supabase
      .from("comments")
      .select("likes_count")
      .eq("id", commentId)
      .single();
    
    if (fetchErr) {
      console.error("Error fetching comment for like toggle:", fetchErr);
      throw fetchErr;
    }

    const currentLikes = data.likes_count || 0;
    const newLikes = increment ? currentLikes + 1 : Math.max(0, currentLikes - 1);

    const { error: updateErr } = await supabase
      .from("comments")
      .update({ likes_count: newLikes })
      .eq("id", commentId);

    if (updateErr) {
      console.error("Error updating comment likes_count:", updateErr);
      throw updateErr;
    }

    return newLikes;
  }
};
