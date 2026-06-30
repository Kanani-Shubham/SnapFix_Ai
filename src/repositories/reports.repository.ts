import { supabase } from "../lib/supabaseClient";
import { Report, ReportMedia, IssueCategory, SeverityLevel } from "../types";

export function mapCategoryToDb(category: string): string {
  switch (category) {
    case "Potholes": return "pothole";
    case "Garbage": return "garbage";
    case "Water": return "water_leakage";
    case "Streetlight": return "streetlight";
    case "Public Safety": return "public_safety";
    case "Traffic Hazard": return "traffic_hazard";
    default: return (category || "other").toLowerCase();
  }
}

export function mapCategoryFromDb(category: string): IssueCategory {
  switch (category) {
    case "pothole": return IssueCategory.POTHOLE;
    case "garbage": return IssueCategory.GARBAGE;
    case "water_leakage": return IssueCategory.WATER;
    case "streetlight": return IssueCategory.STREETLIGHT;
    case "public_safety": return IssueCategory.PUBLIC_SAFETY;
    case "traffic_hazard": return IssueCategory.TRAFFIC_HAZARD;
    default: return IssueCategory.OTHER;
  }
}

export function mapSeverityToDb(severity: string): string {
  return (severity || "low").toLowerCase();
}

export function mapSeverityFromDb(severity: string): SeverityLevel {
  switch ((severity || "").toLowerCase()) {
    case "low": return SeverityLevel.LOW;
    case "medium": return SeverityLevel.MEDIUM;
    case "high": return SeverityLevel.HIGH;
    case "critical": return SeverityLevel.CRITICAL;
    default: return SeverityLevel.LOW;
  }
}

export function mapReportFromDb(r: any): Report {
  if (!r) return r;
  return {
    ...r,
    reporter_profile_id: r.reporter_id,
    category: mapCategoryFromDb(r.category),
    severity: mapSeverityFromDb(r.severity)
  };
}

export const reportsRepository = {
  async getAll(): Promise<Report[]> {
    // Query the existing report_feed view for full detailed view of reports
    const { data, error } = await supabase
      .from("report_feed")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching report_feed view:", error);
      // Fallback to reports table if view is not found/not configured
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (fallbackError) throw fallbackError;
      return (fallbackData || []).map((r: any) => mapReportFromDb(r));
    }
    return (data || []).map((r: any) => mapReportFromDb(r));
  },

  async getById(id: string): Promise<Report | null> {
    const { data, error } = await supabase
      .from("report_feed")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching report by id:", error);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (fallbackError) throw fallbackError;
      return fallbackData ? mapReportFromDb(fallbackData) : null;
    }
    return data ? mapReportFromDb(data) : null;
  },

  async create(report: Omit<Report, "id" | "report_code" | "created_at" | "updated_at" | "reporter_name" | "reporter_avatar" | "department_name" | "verification_count" | "dispute_count">): Promise<Report> {
    // Generate a unique report code
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    const reportCode = `SFIX-${dateStr}-${rand}`;

    const allowedKeys = [
      "latitude",
      "longitude",
      "category",
      "subcategory",
      "description",
      "status",
      "severity",
      "address",
      "city",
      "ward",
      "district",
      "state",
      "country",
      "postal_code",
      "landmark",
      "is_duplicate",
      "duplicate_of_id",
      "confidence",
      "verification_count",
      "dispute_count",
      "department_id",
      "impact_score",
      "urgency",
      "priority"
    ];

    const cleanInsert: any = {};
    for (const key of allowedKeys) {
      if (key in report) {
        cleanInsert[key] = (report as any)[key];
      }
    }

    if (cleanInsert.category) {
      cleanInsert.category = mapCategoryToDb(cleanInsert.category);
    }
    if (cleanInsert.severity) {
      cleanInsert.severity = mapSeverityToDb(cleanInsert.severity);
    }

    const { data, error } = await supabase
      .from("reports")
      .insert({
        ...cleanInsert,
        reporter_id: report.reporter_profile_id,
        report_code: reportCode,
        verification_count: 0,
        dispute_count: 0,
        status: report.status || "submitted"
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating report:", error);
      throw error;
    }
    return mapReportFromDb(data);
  },

  async update(id: string, updates: Partial<Report>): Promise<Report> {
    const allowedKeys = [
      "latitude",
      "longitude",
      "category",
      "subcategory",
      "description",
      "status",
      "severity",
      "address",
      "city",
      "ward",
      "district",
      "state",
      "country",
      "postal_code",
      "landmark",
      "is_duplicate",
      "duplicate_of_id",
      "confidence",
      "verification_count",
      "dispute_count",
      "department_id",
      "impact_score",
      "urgency",
      "priority"
    ];

    const cleanUpdates: any = {};
    for (const key of allowedKeys) {
      if (key in updates) {
        cleanUpdates[key] = (updates as any)[key];
      }
    }

    if (updates.reporter_profile_id) {
      cleanUpdates.reporter_id = updates.reporter_profile_id;
    }

    if (cleanUpdates.category) {
      cleanUpdates.category = mapCategoryToDb(cleanUpdates.category);
    }
    if (cleanUpdates.severity) {
      cleanUpdates.severity = mapSeverityToDb(cleanUpdates.severity);
    }

    const { data, error } = await supabase
      .from("reports")
      .update({
        ...cleanUpdates,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating report:", error);
      throw error;
    }
    return mapReportFromDb(data);
  },

  async getNearby(lat: number, lng: number, radiusMeters: number = 5000): Promise<Report[]> {
    const { data, error } = await supabase.rpc("nearby_reports", {
      lat: lat,
      lng: lng,
      radius: radiusMeters
    });

    if (error) {
      console.error("Error calling nearby_reports RPC function:", error);
      // Fallback to filtering in-memory or standard select if RPC fails
      const all = await this.getAll();
      return all.filter(r => {
        const d = Math.sqrt(Math.pow(r.latitude - lat, 2) + Math.pow(r.longitude - lng, 2)) * 111000;
        return d <= radiusMeters;
      });
    }
    return (data || []).map((r: any) => mapReportFromDb(r));
  },

  async createMedia(media: Omit<ReportMedia, "id" | "created_at">): Promise<ReportMedia> {
    const { data, error } = await supabase
      .from("report_media")
      .insert({
        report_id: media.report_id,
        storage_path: media.storage_path,
        type: media.mime_type || media.role || "image/jpeg"
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating report_media record:", error);
      throw error;
    }
    return {
      id: data.id,
      report_id: data.report_id,
      storage_bucket: "reports",
      storage_path: data.storage_path,
      public_url: data.storage_path,
      mime_type: data.type,
      file_size_bytes: 0,
      role: "before",
      created_at: data.created_at
    };
  },

  async getMediaForReport(reportId: string): Promise<ReportMedia[]> {
    const { data, error } = await supabase
      .from("report_media")
      .select("*")
      .eq("report_id", reportId);

    if (error) {
      console.error("Error fetching report_media:", error);
      return [];
    }
    return (data || []).map((m: any) => ({
      id: m.id,
      report_id: m.report_id,
      storage_bucket: "reports",
      storage_path: m.storage_path,
      public_url: m.storage_path,
      mime_type: m.type,
      file_size_bytes: 0,
      role: "before",
      created_at: m.created_at
    }));
  }
};
