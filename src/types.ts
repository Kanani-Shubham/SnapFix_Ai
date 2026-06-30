export enum IssueCategory {
  POTHOLE = "Potholes",
  GARBAGE = "Garbage",
  WATER = "Water",
  STREETLIGHT = "Streetlight",
  PUBLIC_SAFETY = "Public Safety",
  TRAFFIC_HAZARD = "Traffic Hazard",
  OTHER = "Other"
}

export enum ReportStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  AI_PROCESSING = "ai_processing",
  DUPLICATE_FOUND = "duplicate_found",
  COMMUNITY_VERIFICATION = "community_verification",
  VERIFIED = "verified",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  REJECTED = "rejected",
  ARCHIVED = "archived"
}

export enum SeverityLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical"
}

export interface Profile {
  id: string;
  firebase_uid: string;
  name: string;
  email: string;
  avatar_url: string;
  role: "citizen" | "department_officer" | "admin";
  points: number;
  level: number;
  created_at: string;
}

export interface Report {
  id: string;
  report_code: string;
  reporter_profile_id: string;
  category: IssueCategory;
  severity: SeverityLevel;
  status: ReportStatus;
  address: string;
  city: string;
  ward: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  verification_count: number;
  dispute_count: number;
  ai_confidence_score?: number;
  ai_impact_score?: number; // 0 - 10
  assigned_department_id?: string;
  duplicate_of_report_id?: string | null;
  created_at: string;
  updated_at: string;
  // Included fields for UI convenience from join/views
  reporter_name?: string;
  reporter_avatar?: string;
  department_name?: string;
  media_url?: string;
  description?: string;
}

export interface ReportMedia {
  id: string;
  report_id: string;
  storage_bucket: "reports" | "report-videos" | "before-after" | "avatars";
  storage_path: string;
  public_url: string;
  mime_type: string;
  file_size_bytes: number;
  role: "before" | "after" | "thumbnail" | "ai_overlay";
  created_at: string;
}

export interface Verification {
  id: string;
  report_id: string;
  profile_id: string;
  verification_type: "verify" | "dispute" | "duplicate_flag";
  created_at: string;
}

export interface Comment {
  id: string;
  report_id: string;
  profile_id: string;
  profile_name: string;
  profile_avatar: string;
  content: string;
  parent_comment_id?: string | null;
  is_pinned: boolean;
  is_ai_moderated: boolean;
  created_at: string;
  likes_count: number;
  has_liked?: boolean;
}

export interface Story {
  id: string;
  profile_id: string;
  profile_name: string;
  profile_avatar: string;
  media_url: string;
  expires_at: string;
  created_at: string;
  category?: IssueCategory;
  views_count: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  criteria: string; // JSON description
  unlocked: boolean;
}

export interface UserBadge {
  id: string;
  profile_id: string;
  badge_id: string;
  earned_at: string;
}

export interface Notification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: "status_update" | "new_comment" | "verification_request" | "points_earned" | "badge_unlocked" | "duplicate_detected";
  created_at: string;
}

export interface Prediction {
  id: string;
  risk_score: number; // 0 - 100
  latitude: number;
  longitude: number;
  radius_meters: number;
  predicted_date: string;
  category: IssueCategory;
  based_on_report_ids: string[];
}

export interface AgentLog {
  id: string;
  report_id: string;
  agent: "vision_agent" | "severity_agent" | "duplicate_agent" | "routing_agent" | "prediction_agent" | "community_agent" | "notification_agent" | "resolution_validation_agent";
  input: string; // JSON
  output: string; // JSON
  confidence_score: number;
  execution_time_ms: number;
  status: "pending" | "running" | "success" | "failed" | "retried" | "skipped";
  model_version: string;
  created_at: string;
}

export interface PointsLedger {
  id: string;
  profile_id: string;
  points: number;
  reason: string;
  report_id?: string;
  created_at: string;
}
