import { supabase } from "../lib/supabaseClient";
import { Verification } from "../types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_VOTE_TYPES = ["verify", "dispute", "duplicate_flag"];

function validateUuid(id: string, name: string) {
  if (!id) {
    throw new Error(`Validation Error: ${name} is required.`);
  }
  if (!UUID_REGEX.test(id)) {
    throw new Error(`Validation Error: Invalid UUID format for ${name} ("${id}").`);
  }
}

export const verificationRepository = {
  async getByReportId(reportId: string): Promise<Verification[]> {
    validateUuid(reportId, "Report ID");

    const { data, error } = await supabase
      .from("verifications")
      .select("*")
      .eq("report_id", reportId);

    if (error) {
      console.error("Error fetching verifications:", error);
      throw error;
    }
    return (data || []).map((v: any) => ({
      id: v.id,
      report_id: v.report_id,
      profile_id: v.verifier_id,
      verification_type: v.vote as "verify" | "dispute" | "duplicate_flag",
      created_at: v.created_at
    }));
  },

  async create(verification: Omit<Verification, "id" | "created_at">): Promise<Verification> {
    validateUuid(verification.report_id, "Report ID");
    validateUuid(verification.profile_id, "Verifier Profile ID");
    
    if (!verification.verification_type) {
      throw new Error("Validation Error: Verification type is required.");
    }
    if (!ALLOWED_VOTE_TYPES.includes(verification.verification_type)) {
      throw new Error(`Validation Error: Invalid verification type ("${verification.verification_type}"). Must be one of: ${ALLOWED_VOTE_TYPES.join(", ")}`);
    }

    const { data, error } = await supabase
      .from("verifications")
      .insert({
        report_id: verification.report_id,
        verifier_id: verification.profile_id,
        vote: verification.verification_type
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating verification:", error);
      throw error;
    }

    // Simultaneously update the report counts to ensure the UI stays synchronized
    const isVerify = verification.verification_type === "verify";
    const isDispute = verification.verification_type === "dispute";

    if (isVerify || isDispute) {
      const fieldToIncrement = isVerify ? "verification_count" : "dispute_count";
      
      // Get current counts first
      const { data: reportData } = await supabase
        .from("reports")
        .select("verification_count, dispute_count")
        .eq("id", verification.report_id)
        .single();

      if (reportData) {
        const currentVal = reportData[fieldToIncrement] || 0;
        await supabase
          .from("reports")
          .update({ [fieldToIncrement]: currentVal + 1 })
          .eq("id", verification.report_id);
      }
    }

    return {
      id: data.id,
      report_id: data.report_id,
      profile_id: data.verifier_id,
      verification_type: data.vote as "verify" | "dispute" | "duplicate_flag",
      created_at: data.created_at
    };
  },

  async getAll(): Promise<Verification[]> {
    const { data, error } = await supabase
      .from("verifications")
      .select("*");

    if (error) {
      console.error("Error fetching all verifications:", error);
      return [];
    }

    return (data || []).map((v: any) => ({
      id: v.id,
      report_id: v.report_id,
      profile_id: v.verifier_id,
      verification_type: v.vote as "verify" | "dispute" | "duplicate_flag",
      created_at: v.created_at
    }));
  },

  async delete(reportId: string, profileId: string): Promise<void> {
    validateUuid(reportId, "Report ID");
    validateUuid(profileId, "Profile ID");

    // Get the verification record first to find the type of vote (so we know what count to decrement)
    const { data: existing, error: fetchErr } = await supabase
      .from("verifications")
      .select("*")
      .eq("report_id", reportId)
      .eq("verifier_id", profileId);

    if (fetchErr) {
      console.error("Error fetching verification for deletion:", fetchErr);
      throw fetchErr;
    }

    if (!existing || existing.length === 0) {
      return; // Nothing to delete
    }

    const record = existing[0];
    const voteType = record.vote; // "verify" | "dispute" | "duplicate_flag"

    // Delete verification record
    const { error: delErr } = await supabase
      .from("verifications")
      .delete()
      .eq("id", record.id);

    if (delErr) {
      console.error("Error deleting verification record:", delErr);
      throw delErr;
    }

    // Simultaneously update the report counts to ensure the UI stays synchronized
    const isVerify = voteType === "verify";
    const isDispute = voteType === "dispute";

    if (isVerify || isDispute) {
      const fieldToDecrement = isVerify ? "verification_count" : "dispute_count";
      
      // Get current counts first
      const { data: reportData } = await supabase
        .from("reports")
        .select("verification_count, dispute_count")
        .eq("id", reportId)
        .single();

      if (reportData) {
        const currentVal = reportData[fieldToDecrement] || 0;
        const newVal = Math.max(0, currentVal - 1);
        await supabase
          .from("reports")
          .update({ [fieldToDecrement]: newVal })
          .eq("id", reportId);
      }
    }
  }
};
