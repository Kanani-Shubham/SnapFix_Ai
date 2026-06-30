import { supabase } from "../lib/supabaseClient";

export interface DepartmentDashboardRow {
  department_id: string;
  department_name: string;
  total_reports: number;
  resolved_reports: number;
  in_progress_reports: number;
  pending_reports: number;
  avg_resolution_time_hours?: number;
}

export const analyticsRepository = {
  async getDepartmentMetrics(): Promise<DepartmentDashboardRow[]> {
    const { data, error } = await supabase
      .from("department_dashboard")
      .select("*");

    if (error) {
      console.error("Error fetching department_dashboard view:", error);
      // Fallback: build aggregations from reports table directly
      const { data: reports, error: reportsErr } = await supabase
        .from("reports")
        .select("status, assigned_department_id");
        
      if (reportsErr) throw reportsErr;
      
      const metricsMap: Record<string, DepartmentDashboardRow> = {};
      (reports || []).forEach((r: any) => {
        const deptId = r.assigned_department_id || "unassigned";
        if (!metricsMap[deptId]) {
          metricsMap[deptId] = {
            department_id: deptId,
            department_name: deptId === "unassigned" ? "Unassigned Issues" : `${deptId.toUpperCase()} Dept`,
            total_reports: 0,
            resolved_reports: 0,
            in_progress_reports: 0,
            pending_reports: 0
          };
        }
        const m = metricsMap[deptId];
        m.total_reports++;
        if (r.status === "resolved") m.resolved_reports++;
        else if (r.status === "in_progress") m.in_progress_reports++;
        else m.pending_reports++;
      });
      
      return Object.values(metricsMap);
    }
    
    return data || [];
  },

  async getGlobalStats() {
    const { data: reports, error } = await supabase
      .from("reports")
      .select("status, severity, category");

    if (error) {
      console.error("Error fetching global stats from reports:", error);
      return {
        total: 0,
        resolved: 0,
        inProgress: 0,
        pending: 0,
        byCategory: {},
        bySeverity: {}
      };
    }

    const stats = {
      total: reports?.length || 0,
      resolved: 0,
      inProgress: 0,
      pending: 0,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>
    };

    (reports || []).forEach((r: any) => {
      if (r.status === "resolved") stats.resolved++;
      else if (r.status === "in_progress") stats.inProgress++;
      else stats.pending++;

      if (r.category) {
        stats.byCategory[r.category] = (stats.byCategory[r.category] || 0) + 1;
      }
      if (r.severity) {
        stats.bySeverity[r.severity] = (stats.bySeverity[r.severity] || 0) + 1;
      }
    });

    return stats;
  }
};
