import { supabase } from "../lib/supabaseClient";
import { Notification } from "../types";

export const notificationsRepository = {
  async getByProfileId(profileId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
    return (data || []).map((n: any) => ({
      id: n.id,
      profile_id: n.recipient_id,
      title: n.title,
      message: n.body || "",
      is_read: n.is_read,
      type: n.type,
      created_at: n.created_at
    }));
  },

  async create(notification: Omit<Notification, "id" | "created_at">): Promise<Notification> {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        recipient_id: notification.profile_id,
        title: notification.title,
        body: notification.message,
        is_read: notification.is_read || false,
        type: notification.type
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
    return {
      id: data.id,
      profile_id: data.recipient_id,
      title: data.title,
      message: data.body || "",
      is_read: data.is_read,
      type: data.type,
      created_at: data.created_at
    };
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  async markAllAsRead(profileId: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", profileId);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }
};
