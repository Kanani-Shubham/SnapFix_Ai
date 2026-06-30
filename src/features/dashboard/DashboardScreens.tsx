import React, { useState } from "react";
import { motion } from "motion/react";
import { useApp } from "../../context/AppContext";
import { IssueCategory, ReportStatus, SeverityLevel } from "../../types";
import { 
  BarChart as ReBarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie 
} from "recharts";
import { 
  Bell, Award, User, CheckCircle2, Sliders, ArrowUpRight, ChevronRight, 
  MapPin, ShieldAlert, AlertTriangle, Eye, ThumbsUp, Calendar, Zap, 
  Sparkles, Check, Play, UserCheck, Clock, Layers, RefreshCw, Trash2, MessageSquare
} from "lucide-react";
import { SeverityBadge, StatusBadge } from "../../components/BadgeComponents";
import { BadgeTile } from "../../components/BadgeTile";

interface ScreenProps {
  onNavigate: (screenId: string) => void;
  reportId?: string;
  setReportId?: (id: string) => void;
}

// 9. Issue Details Screen
export const IssueDetailsScreen: React.FC<ScreenProps> = ({ onNavigate, reportId }) => {
  const { reports, voteReport, toggleBookmark, bookmarks, resolveReport } = useApp();
  const report = reports.find(r => r.id === reportId) || reports.find(r => r.id.startsWith("rep-temp-")) || reports[0];
  const isBookmarked = bookmarks.includes(report.id);

  return (
    <div className="flex flex-col gap-4 p-5 bg-white min-h-[500px]" id="details-screen">
      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tracking Reference</span>
          <h2 className="text-sm font-black text-slate-900 leading-none mt-1">{report.report_code}</h2>
        </div>
        <div className="flex gap-1.5">
          <SeverityBadge severity={report.severity} />
          <StatusBadge status={report.status} />
        </div>
      </div>

      {/* Media Image View */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
        <img 
          src={report.media_url} 
          alt={report.category} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
          {report.category}
        </div>
      </div>

      {/* Details Box */}
      <div className="flex flex-col gap-3">
        {/* Reporter Section */}
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
          <img 
            src={report.reporter_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"} 
            alt={report.reporter_name} 
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="text-xs font-bold text-slate-800">{report.reporter_name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Community Reporter</p>
          </div>
        </div>

        {/* Text Description */}
        <div>
          <h4 className="text-slate-900 font-bold text-sm">Issue Description</h4>
          <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">
            {report.description || "The community has reported pavement distress / potholes in this section of the roadway."}
          </p>
        </div>

        {/* Coords & Ward location */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-[#00BCD4] shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Urban Sector Code</p>
            <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">{report.address}</p>
          </div>
        </div>
      </div>

      {/* Interactions Strip */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {/* Verify button */}
        <button 
          onClick={() => voteReport(report.id, "verify")}
          disabled={report.status === ReportStatus.RESOLVED}
          className="py-3.5 bg-slate-50 hover:bg-[#FFF7A6] border border-slate-150 rounded-full flex items-center justify-center gap-2 font-bold text-xs text-slate-700 hover:text-black transition-all disabled:opacity-50"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Verify ({report.verification_count})</span>
        </button>

        {/* Comments Thread button */}
        <button 
          onClick={() => onNavigate("comments")}
          className="py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-full flex items-center justify-center gap-2 font-bold text-xs text-slate-700 hover:text-black transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Discussion board</span>
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={() => onNavigate("progress")}
          className="w-full py-4 bg-[#FFFC00] text-black font-extrabold rounded-full shadow-lg hover:bg-yellow-300 active:scale-95 transition-all text-xs uppercase tracking-wider"
          id="track-progress-details-btn"
        >
          Track Issue Progress
        </button>
        
        {/* Officer Resolution Trigger simulation */}
        {report.status !== ReportStatus.RESOLVED && (
          <button
            onClick={() => {
              resolveReport(report.id, "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&q=80&w=400");
              onNavigate("resolution");
            }}
            className="w-full py-3.5 border border-dashed border-[#4CAF50] hover:bg-green-50/20 text-[#4CAF50] rounded-full font-bold text-xs tracking-wider uppercase transition-colors mt-1"
            id="resolve-report-officer-btn"
          >
            Mark Resolved (Officer Mock)
          </button>
        )}
      </div>
    </div>
  );
};

// 10. Notifications / Alerts Screen
export const NotificationsScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { notifications, markAllNotificationsAsRead } = useApp();

  return (
    <div className="flex flex-col gap-4 p-5 bg-slate-50 min-h-[500px]" id="notifications-screen">
      <div className="flex justify-between items-center pl-1 leading-none">
        <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest">Citizen Alerts Inbox</h3>
        <button 
          onClick={markAllNotificationsAsRead}
          className="text-[11px] text-[#2196F3] font-bold"
          id="mark-all-read-btn"
        >
          Mark all as read
        </button>
      </div>

      <div className="flex flex-col gap-2.5" id="notifications-list">
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
              notif.is_read 
                ? "bg-white border-slate-100 opacity-75" 
                : "bg-white border-[#FFF7A6] shadow-sm ring-1 ring-[#FFF7A6]/40"
            }`}
            id={`notif-item-${notif.id}`}
          >
            <div className={`p-2.5 rounded-full ${
              notif.type === "points_earned" ? "bg-[#FFF7A6]/40 text-[#FF9800]" : "bg-slate-50 text-[#2196F3]"
            }`}>
              <Bell className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">{notif.title}</h4>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!notif.is_read && <span className="w-2 h-2 rounded-full bg-[#FF9800]" />}
                  <span className="text-[9px] text-slate-400">10m ago</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 11. Leaderboard Screen
export const LeaderboardScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly" | "all">("weekly");

  const topThree = [
    { rank: 2, name: "Neha", points: "1,280 XP", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" },
    { rank: 1, name: "Shubham", points: "1,560 XP", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", highlight: true },
    { rank: 3, name: "Aman", points: "1,100 XP", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" }
  ];

  const others = [
    { rank: 4, name: "Ketan Patel", points: "980 XP" },
    { rank: 5, name: "Riya Sen", points: "870 XP" },
    { rank: 6, name: "Kiran Deshmukh", points: "650 XP" },
    { rank: 7, name: "Vivek Joshi", points: "540 XP" }
  ];

  return (
    <div className="flex flex-col gap-4 p-5 bg-slate-50 min-h-[500px]" id="leaderboard-screen">
      {/* Category selector */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
        {["weekly", "monthly", "all"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
              activeTab === tab ? "bg-white text-black shadow-sm" : "text-slate-500"
            }`}
          >
            {tab === "all" ? "All Time" : tab}
          </button>
        ))}
      </div>

      {/* Podium Render */}
      <div className="flex justify-center items-end gap-4 py-6 px-2 bg-gradient-to-t from-slate-100 to-transparent rounded-2xl">
        {topThree.map(user => (
          <div key={user.rank} className="flex flex-col items-center relative">
            <div className={`relative ${user.highlight ? "w-18 h-18" : "w-14 h-14"}`}>
              <img 
                src={user.avatar} 
                alt={user.name} 
                className={`w-full h-full rounded-full object-cover border-2 ${user.highlight ? "border-[#FFFC00]" : "border-white"}`}
                referrerPolicy="no-referrer"
              />
              {user.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg text-[#FFFC00]">👑</div>
              )}
            </div>
            <span className="text-xs font-bold text-slate-800 mt-2">{user.name}</span>
            <span className="text-[10px] text-slate-450 leading-none mt-0.5">{user.points}</span>
            
            {/* Mock Podium blocks */}
            <div className={`mt-2 rounded-t-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-700 shadow-sm ${
              user.highlight ? "w-14 h-14 bg-yellow-50/20 border-yellow-250 text-[#FF9800]" : "w-12 h-10"
            }`}>
              {user.rank}
            </div>
          </div>
        ))}
      </div>

      {/* Others list rows */}
      <div className="flex flex-col gap-2">
        {others.map(user => (
          <div key={user.rank} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-slate-400 w-5">{user.rank}</span>
              <span className="text-xs font-bold text-slate-800">{user.name}</span>
            </div>
            <span className="text-xs font-bold text-[#FF9800]">{user.points}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onNavigate("profile")}
        className="w-full py-4 bg-[#FFFC00] text-black font-extrabold rounded-full shadow-lg hover:bg-yellow-300 active:scale-95 transition-all text-sm uppercase tracking-wider mt-4"
        id="view-my-snapscore-btn"
      >
        View My SnapScore Details
      </button>
    </div>
  );
};

// 12. Profile / SnapScore Screen
export const ProfileScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { currentProfile, badges } = useApp();

  return (
    <div className="flex flex-col gap-5 p-5 bg-white min-h-[500px]" id="profile-screen">
      {/* Header section */}
      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-150">
        <div className="relative">
          <img 
            src={currentProfile.avatar_url} 
            alt={currentProfile.name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-[#FFFC00] shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 bg-black text-[#FFFC00] px-1.5 py-0.5 rounded-md text-[9px] font-black leading-none border border-white">
            LVL {currentProfile.level}
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">{currentProfile.name}</h2>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold leading-none mt-1 block">Hyperlocal Community Hero</span>
          
          {/* XP Progress Slider */}
          <div className="flex flex-col gap-1 mt-2.5">
            <div className="flex justify-between text-[10px] font-bold leading-none">
              <span className="text-[#FF9800]">Score XP: {currentProfile.points}</span>
              <span className="text-slate-400">Next level: 500 XP</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#FF9800] rounded-full" style={{ width: `${(currentProfile.points % 100) * 1}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid count totals */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Submitted", val: 4, color: "text-[#2196F3]" },
          { label: "Verified", val: 12, color: "text-[#00BCD4]" },
          { label: "Resolved", val: 2, color: "text-green-500" }
        ].map(card => (
          <div key={card.label} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
            <span className={`text-xl font-black block leading-none ${card.color}`}>{card.val}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Gamification Badges Section */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center pl-1 leading-none">
          <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest">Unlocked Achievements</h3>
          <button 
            onClick={() => onNavigate("badges")}
            className="text-[11px] text-[#2196F3] font-bold flex items-center"
            id="view-all-badges-btn"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {badges.filter(b => b.unlocked).slice(0, 2).map(badge => (
            <BadgeTile key={badge.id} badge={badge} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mt-2">
        <button
          onClick={() => onNavigate("history")}
          className="w-full py-4 bg-black text-white font-extrabold rounded-full shadow-lg hover:bg-slate-800 active:scale-95 transition-all text-xs uppercase tracking-wider"
          id="view-reports-history-btn"
        >
          My Submissions Log
        </button>
        <button
          onClick={() => onNavigate("settings")}
          className="w-full py-3 border border-slate-250 rounded-full font-semibold text-slate-700 hover:text-black transition-colors text-xs"
        >
          App Preferences Panel
        </button>
      </div>
    </div>
  );
};

// 13. AI Insights Dashboard Screen
export const AIInsightsScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const chartData = [
    { name: "Potholes", count: 45 },
    { name: "Garbage", count: 25 },
    { name: "Water", count: 16 },
    { name: "Light", count: 10 },
    { name: "Others", count: 5 }
  ];

  const COLORS = ["#F44336", "#FF9800", "#2196F3", "#FFFC00", "#9C27B0"];

  return (
    <div className="flex flex-col gap-5 p-5 bg-white min-h-[500px]" id="insights-screen">
      {/* Overview Aggregation Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block">Annual Total Reports</span>
          <span className="text-xl font-black text-slate-900 block mt-1">1,248</span>
          <span className="text-[10px] text-green-500 font-semibold flex items-center gap-0.5 mt-0.5">+12% vs last month</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block">Annual Resolutions</span>
          <span className="text-xl font-black text-slate-900 block mt-1">876</span>
          <span className="text-[10px] text-green-500 font-semibold flex items-center gap-0.5 mt-0.5">+16% vs last month</span>
        </div>
      </div>

      {/* Recharts Graphical visualization */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col gap-3">
        <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest leading-none">Distribution of Local Issues</h3>
        
        {/* Simple mock SVG Chart representation for robust cross-browser safety or Recharts */}
        <div className="h-44 w-full flex items-end justify-around gap-2 px-1 pt-4 pb-1 bg-white border border-slate-100 rounded-xl" id="diagnostic-recharts">
          {chartData.map((data, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
              <span className="text-[9px] font-black text-slate-700 leading-none mb-1">{data.count}%</span>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${data.count * 1.5}px` }}
                className="w-6 rounded-t-md shadow-sm"
                style={{ backgroundColor: COLORS[idx] }}
              />
              <span className="text-[8px] text-slate-400 font-bold truncate max-w-[40px] mt-2">{data.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings & Hotspots summary panel */}
      <div className="flex flex-col gap-2 bg-red-50/20 p-4 rounded-2xl border border-red-100">
        <h4 className="text-xs font-extrabold text-[#F44336] uppercase tracking-wider flex items-center gap-1.5 leading-none">
          <ShieldAlert className="w-4 h-4 text-[#F44336]" />
          AI Predicted High Risk Hotspots
        </h4>
        <p className="text-[11px] text-slate-600 leading-normal mt-1">
          Based on historical category recurrence, several sectors are forecasted to have increased pavement damage risk.
        </p>
        
        <div className="flex flex-col gap-1.5 mt-2">
          {[
            { area: "GIDC Area, Sector 3", index: "82% Risk", color: "text-[#F44336]" },
            { area: "Jamnagar City Circle", index: "64% Risk", color: "text-[#FF9800]" }
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-700">{item.area}</span>
              <span className={`text-xs font-black ${item.color}`}>{item.index}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 14. Report History Screen
export const ReportHistoryScreen: React.FC<ScreenProps> = ({ onNavigate, setReportId }) => {
  const { reports } = useApp();

  const handleSelect = (id: string) => {
    if (setReportId) setReportId(id);
    onNavigate("details");
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-slate-50 min-h-[500px]" id="history-screen">
      <div className="flex justify-between items-center leading-none">
        <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest pl-1">My Submissions Log</h3>
        <span className="text-xs bg-slate-200 px-2.5 py-1 rounded-full text-slate-700 font-semibold">Total: 4</span>
      </div>

      <div className="flex flex-col gap-3" id="history-reports-list">
        {reports.map(rep => (
          <div 
            key={rep.id}
            onClick={() => handleSelect(rep.id)}
            className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <img 
              src={rep.media_url} 
              alt={rep.category} 
              className="w-14 h-14 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{rep.category}</span>
                <StatusBadge status={rep.status} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{rep.report_code}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{rep.address}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 15. Admin Dashboard Screen
export const AdminDashboardScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { reports, setReports } = useApp();

  const handleModeratorDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReports(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="flex flex-col gap-5 p-5 bg-slate-50 min-h-[500px]" id="admin-dashboard-screen">
      {/* Metrics Strip */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Active", count: 3, color: "text-[#FF9800]" },
          { label: "Resolved", count: 21, color: "text-green-500" },
          { label: "Flagged", count: 0, color: "text-[#F44336]" }
        ].map(item => (
          <div key={item.label} className="bg-white p-3 rounded-2xl border border-slate-100 text-center shadow-sm">
            <span className={`text-lg font-black block leading-none ${item.color}`}>{item.count}</span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block mt-1 leading-none">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Reports moderations section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest pl-1 leading-none">Reports Administration</h3>
        
        <div className="flex flex-col gap-2.5" id="admin-reports-moderator-list">
          {reports.map(rep => (
            <div 
              key={rep.id}
              className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm"
              id={`admin-rep-${rep.id}`}
            >
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{rep.category}</span>
                  <SeverityBadge severity={rep.severity} />
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-1">{rep.address}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button 
                  onClick={() => onNavigate("workflow")}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[#9C27B0]"
                  title="View AI Agents Pipeline Status"
                  aria-label="Workflow"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => handleModeratorDelete(rep.id, e)}
                  className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-[#F44336]"
                  title="Soft-Delete Report (Audit Trace)"
                  aria-label="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 16. AI Agents Workflow Screen
export const AIAgentsWorkflowScreen: React.FC<ScreenProps> = ({ onNavigate, reportId }) => {
  const { agentLogs } = useApp();

  const activeLogs = agentLogs.filter(l => l.report_id === reportId || l.report_id === "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d");

  const listAgents = [
    { key: "vision_agent", title: "1. Vision Agent", icon: "👁️", desc: "Performs optical category parsing" },
    { key: "severity_agent", title: "2. Severity Agent", icon: "📐", desc: "Calculates impact and severity" },
    { key: "duplicate_agent", title: "3. Duplicate Agent", icon: "🗂️", desc: "Performs geospatial matching" },
    { key: "routing_agent", title: "4. Routing Agent", icon: "🗺️", desc: "Assigns target department and SLA" }
  ];

  return (
    <div className="flex flex-col gap-4 p-5 bg-white min-h-[500px]" id="agents-workflow-screen">
      <div className="text-center">
        <Sparkles className="w-8 h-8 text-[#9C27B0] mx-auto mb-2 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Pipeline Audit Trail</h2>
        <p className="text-slate-500 text-xs mt-1">Audit multi-agent logs execution in real-time</p>
      </div>

      <div className="flex flex-col gap-3" id="admin-agents-workflow-list">
        {listAgents.map(ag => {
          const log = activeLogs.find(l => l.agent === ag.key);
          const isDone = log?.status === "success";
          return (
            <div 
              key={ag.key}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                isDone 
                  ? "bg-slate-50/50 border-green-150" 
                  : "bg-slate-50/20 border-slate-100"
              }`}
            >
              <div className="text-2xl pt-0.5">{ag.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center leading-none">
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">{ag.title}</h4>
                  <span className={`text-[10px] font-bold ${isDone ? "text-green-600" : "text-[#FF9800]"}`}>
                    {isDone ? "Success" : "Pending"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-450 mt-1 leading-normal">{ag.desc}</p>
                
                {/* Log outputs if done */}
                {isDone && log && (
                  <div className="mt-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-[9px] text-[#FFFC00] leading-tight break-all">
                    {log.output}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onNavigate("stories")}
        className="w-full py-4 bg-[#FFFC00] text-black font-extrabold rounded-full shadow-lg hover:bg-yellow-300 active:scale-95 transition-all text-sm uppercase tracking-wider mt-4"
        id="audit-trail-done-btn"
      >
        Done Auditing
      </button>
    </div>
  );
};

// 20. Smart Routing Confirmation Screen
export const SmartRoutingScreen: React.FC<ScreenProps> = ({ onNavigate, reportId }) => {
  const { reports } = useApp();
  const report = reports.find(r => r.id === reportId) || reports.find(r => r.id.startsWith("rep-temp-")) || reports[0];

  return (
    <div className="flex flex-col justify-between p-5 bg-white min-h-[500px]" id="smart-routing-screen">
      <div className="flex flex-col gap-6 text-center mt-4">
        <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/10">
          <Check className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">Smart Routing Confirmed!</h2>
          <span className="text-[11px] text-[#9C27B0] uppercase tracking-widest font-bold mt-1.5 block">Automated Dispatch Complete</span>
        </div>

        {/* Assigned Details Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2.5 text-left">
          <div className="flex justify-between items-center border-b border-slate-150/40 pb-2.5">
            <span className="text-xs text-slate-500 font-semibold">Assigned target</span>
            <span className="text-xs font-bold text-slate-800">{report.department_name || "Road Maintenance Board"}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-150/40 pb-2.5">
            <span className="text-xs text-slate-500 font-semibold">Assigned Officer</span>
            <span className="text-xs font-bold text-slate-800">Rajesh Kumar</span>
          </div>
          <div className="flex justify-between items-center pb-1">
            <span className="text-xs text-slate-500 font-semibold">Resolution ETA</span>
            <span className="text-xs font-bold text-green-600">2 - 3 Days</span>
          </div>
        </div>

        {/* Smart Routing Checklist */}
        <div className="flex flex-col gap-2 text-left bg-[#FFF7A6]/10 p-4 rounded-2xl border border-[#FFFC00]/20">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Checklist Process</h4>
          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            <span>Pothole coordinates verified via reverse-GPS</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            <span>Assigned municipality crew notified with media logs</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onNavigate("progress")}
        className="w-full py-4 bg-[#FFFC00] text-black font-extrabold rounded-full shadow-lg hover:bg-yellow-300 active:scale-95 transition-all text-sm uppercase tracking-wider mt-6"
        id="routing-track-btn"
      >
        Track Progress
      </button>
    </div>
  );
};

// 23. Gamification Badges Screen
export const GamificationBadgesScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { badges } = useApp();
  const [activeFilter, setActiveFilter] = useState<"all" | "unlocked" | "locked">("all");

  const filteredBadges = activeFilter === "all"
    ? badges
    : activeFilter === "unlocked"
      ? badges.filter(b => b.unlocked)
      : badges.filter(b => !b.unlocked);

  return (
    <div className="flex flex-col gap-4 p-5 bg-slate-50 min-h-[500px]" id="badges-screen">
      {/* Category filters */}
      <div className="flex bg-slate-150 p-1 rounded-xl border border-slate-200">
        {[
          { id: "all", label: "All" },
          { id: "unlocked", label: "Earned" },
          { id: "locked", label: "Locked" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeFilter === tab.id ? "bg-white text-black shadow-sm" : "text-slate-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Badges Grid list */}
      <div className="grid grid-cols-2 gap-3" id="badges-grid-list">
        {filteredBadges.map(badge => (
          <BadgeTile key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
};
