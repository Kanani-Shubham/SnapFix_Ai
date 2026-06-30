import React from "react";
import { SeverityLevel, ReportStatus } from "../types";

export const SeverityBadge: React.FC<{ severity: SeverityLevel }> = ({ severity }) => {
  const getStyles = () => {
    switch (severity) {
      case SeverityLevel.LOW:
        return "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30";
      case SeverityLevel.MEDIUM:
        return "bg-[#FF9800]/15 text-[#FF9800] border-[#FF9800]/30";
      case SeverityLevel.HIGH:
        return "bg-[#F44336]/15 text-[#F44336] border-[#F44336]/30";
      case SeverityLevel.CRITICAL:
        return "bg-[#F44336] text-white border-[#F44336]";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles()}`} id={`severity-${severity.toLowerCase()}`}>
      {severity}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ReportStatus }> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case ReportStatus.DRAFT:
      case ReportStatus.SUBMITTED:
        return "bg-gray-100 text-gray-700 border-gray-200";
      case ReportStatus.AI_PROCESSING:
        return "bg-[#9C27B0]/15 text-[#9C27B0] border-[#9C27B0]/30 animate-pulse";
      case ReportStatus.DUPLICATE_FOUND:
        return "bg-red-100 text-red-700 border-red-200";
      case ReportStatus.COMMUNITY_VERIFICATION:
        return "bg-[#00BCD4]/15 text-[#00BCD4] border-[#00BCD4]/30";
      case ReportStatus.VERIFIED:
        return "bg-[#2196F3]/15 text-[#2196F3] border-[#2196F3]/30";
      case ReportStatus.ASSIGNED:
      case ReportStatus.IN_PROGRESS:
        return "bg-[#FF9800]/15 text-[#FF9800] border-[#FF9800]/30";
      case ReportStatus.RESOLVED:
        return "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/30";
      case ReportStatus.REJECTED:
        return "bg-[#F44336]/15 text-[#F44336] border-[#F44336]/30";
      case ReportStatus.ARCHIVED:
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLabel = () => {
    switch (status) {
      case ReportStatus.DRAFT: return "Draft";
      case ReportStatus.SUBMITTED: return "Submitted";
      case ReportStatus.AI_PROCESSING: return "AI Analyzing";
      case ReportStatus.DUPLICATE_FOUND: return "Duplicate";
      case ReportStatus.COMMUNITY_VERIFICATION: return "Verifying";
      case ReportStatus.VERIFIED: return "Verified";
      case ReportStatus.ASSIGNED: return "Assigned";
      case ReportStatus.IN_PROGRESS: return "In Progress";
      case ReportStatus.RESOLVED: return "Resolved";
      case ReportStatus.REJECTED: return "Rejected";
      case ReportStatus.ARCHIVED: return "Archived";
      default: return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles()}`} id={`status-${status}`}>
      {getLabel()}
    </span>
  );
};
