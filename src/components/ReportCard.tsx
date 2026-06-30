import React from "react";
import { motion } from "motion/react";
import { Report, ReportStatus } from "../types";
import { SeverityBadge, StatusBadge } from "./BadgeComponents";
import { MapPin, MessageSquare, ThumbsUp, Bookmark, ChevronRight, Eye } from "lucide-react";
import { useApp } from "../context/AppContext";

interface ReportCardProps {
  report: Report;
  onViewDetails: (id: string) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onViewDetails }) => {
  const { voteReport, toggleBookmark, bookmarks } = useApp();
  const isBookmarked = bookmarks.includes(report.id);

  const getRelativeTime = (isoString: string) => {
    const elapsed = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(elapsed / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
      id={`report-card-${report.id}`}
    >
      {/* Media Content */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden group">
        {report.media_url ? (
          <img 
            src={report.media_url} 
            alt={report.category} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <MapPin className="w-8 h-8" />
            <span className="text-xs">No image uploaded</span>
          </div>
        )}
        
        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <SeverityBadge severity={report.severity} />
          <StatusBadge status={report.status} />
        </div>

        {/* Floating Bookmark Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmark(report.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors z-10 ${
            isBookmarked ? "bg-[#FFFC00] text-black" : "bg-black/40 text-white hover:bg-black/60"
          }`}
          aria-label="Bookmark Report"
          id={`bookmark-btn-${report.id}`}
        >
          <Bookmark className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
        </button>

        {/* Floating Category Tag */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
          {report.category}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col gap-3">
        {/* Reporter Info */}
        <div className="flex items-center gap-2.5">
          <img 
            src={report.reporter_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"} 
            alt={report.reporter_name} 
            className="w-8 h-8 rounded-full object-cover border border-slate-100"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800 leading-tight">{report.reporter_name}</span>
            <span className="text-xs text-slate-500 leading-none mt-0.5">{getRelativeTime(report.created_at)}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-slate-900 font-semibold text-base line-clamp-1">
            {report.category} Issue in {report.city}
          </h4>
          <p className="text-slate-600 text-sm mt-1 line-clamp-2 leading-relaxed">
            {report.description || "No description provided."}
          </p>
        </div>

        {/* Location Display */}
        <div className="flex items-center gap-1.5 text-slate-500 text-xs py-1 border-t border-b border-slate-50">
          <MapPin className="w-3.5 h-3.5 text-[#00BCD4]" />
          <span className="truncate">{report.address}</span>
        </div>

        {/* Card Footer / Interaction Controls */}
        <div className="flex items-center justify-between mt-1">
          {/* Support Vote Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                voteReport(report.id, "verify");
              }}
              disabled={report.status === ReportStatus.RESOLVED}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-[#FFF7A6] text-slate-600 hover:text-black font-medium text-xs border border-slate-100 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              id={`verify-btn-${report.id}`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Verify ({report.verification_count})</span>
            </button>
          </div>

          {/* Details Trigger */}
          <button 
            onClick={() => onViewDetails(report.id)}
            className="flex items-center gap-1 text-slate-700 hover:text-black font-medium text-xs"
            id={`view-btn-${report.id}`}
          >
            <span>View Screen</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
