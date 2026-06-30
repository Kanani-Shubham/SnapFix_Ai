import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Newspaper, Map, Camera, Bell, User, LayoutGrid, 
  Award, Sliders, Settings, HelpCircle, MessageSquare, History 
} from "lucide-react";
import { useApp } from "../context/AppContext";

interface NavProps {
  // We can keep these props for backward compatibility if any old file references them,
  // but they will be overridden by router locations.
  activeScreen?: string;
  setActiveScreen?: (id: string) => void;
}

export const BottomNav: React.FC<NavProps> = () => {
  const { notifications } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/stories" || path === "/home") return "stories";
    if (path === "/map") return "map";
    if (path === "/camera") return "camera";
    if (path === "/notifications") return "notifications";
    if (path === "/profile") return "profile";
    return "";
  };

  const activeTab = getActiveTab();

  const navItems = [
    { id: "stories", label: "Stories", icon: <Newspaper className="w-5 h-5" />, path: "/stories" },
    { id: "map", label: "Map", icon: <Map className="w-5 h-5" />, path: "/map" },
    { id: "camera", label: "Camera", icon: <Camera className="w-6 h-6 text-black" />, isFAB: true, path: "/camera" },
    { id: "notifications", label: "Alerts", icon: <Bell className="w-5 h-5" />, badge: unreadCount, path: "/notifications" },
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" />, path: "/profile" }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-2 flex items-center justify-around z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] h-16" id="mobile-bottom-nav">
      {navItems.map(item => {
        const isActive = activeTab === item.id;
        
        if (item.isFAB) {
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="relative -top-5 w-14 h-14 bg-[#FFFC00] rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-300 active:scale-95 transition-all z-50 border-4 border-white"
              id="fab-camera-btn"
              aria-label="Camera FAB"
            >
              {item.icon}
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 relative transition-all ${
              isActive ? "text-black font-semibold" : "text-slate-400 hover:text-slate-600"
            }`}
            id={`nav-item-${item.id}`}
          >
            <div className={`p-1.5 rounded-full relative ${isActive ? "bg-[#FFFC00] text-black" : ""}`}>
              {item.icon}
              {!!item.badge && (
                <span className="absolute -top-1 -right-1 bg-[#F44336] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight leading-none mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const NavigationRail: React.FC<NavProps> = () => {
  const { notifications } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getActiveItem = () => {
    const path = location.pathname;
    if (path === "/stories" || path === "/home") return "stories";
    if (path === "/map") return "map";
    if (path === "/camera") return "camera";
    if (path === "/notifications") return "notifications";
    if (path === "/profile") return "profile";
    if (path === "/dashboard") return "insights";
    if (path === "/admin") return "admin";
    if (path === "/history") return "history";
    if (path === "/chat") return "chat";
    return "";
  };

  const activeItem = getActiveItem();

  const railItems = [
    { id: "insights", label: "Dashboard", icon: <LayoutGrid className="w-5 h-5" />, path: "/dashboard" },
    { id: "stories", label: "Stories", icon: <Newspaper className="w-5 h-5" />, path: "/stories" },
    { id: "map", label: "Map", icon: <Map className="w-5 h-5" />, path: "/map" },
    { id: "camera", label: "Camera", icon: <Camera className="w-5 h-5" />, path: "/camera" },
    { id: "history", label: "History", icon: <History className="w-5 h-5" />, path: "/history" },
    { id: "notifications", label: "Alerts", icon: <Bell className="w-5 h-5" />, badge: unreadCount, path: "/notifications" },
    { id: "chat", label: "Gemini", icon: <MessageSquare className="w-5 h-5" />, path: "/chat" },
    { id: "admin", label: "Admin", icon: <Sliders className="w-5 h-5" />, path: "/admin" },
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" />, path: "/profile" }
  ];

  return (
    <div className="hidden md:flex lg:hidden flex-col w-20 bg-slate-900 text-white h-screen sticky top-0 border-r border-slate-800 py-6 items-center justify-between shrink-0 z-40" id="tablet-navigation-rail">
      {/* Short Brand Logo */}
      <div className="w-10 h-10 bg-[#FFFC00] rounded-xl flex items-center justify-center shadow-lg font-black text-black text-xl mb-8 cursor-pointer" onClick={() => navigate("/stories")}>
        S
      </div>

      {/* Rail Nav Items */}
      <div className="flex-1 flex flex-col gap-4 items-center w-full px-2">
        {railItems.map(item => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`p-3 rounded-xl transition-all relative flex flex-col items-center justify-center group ${
                isActive 
                  ? "bg-[#FFFC00] text-black shadow-md" 
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
              title={item.label}
              id={`rail-item-${item.id}`}
            >
              {item.icon}
              {!!item.badge && (
                <span className={`absolute top-1 right-1 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                  isActive ? "bg-black text-white" : "bg-[#F44336] text-white"
                }`}>
                  {item.badge}
                </span>
              )}
              {/* Tooltip on Hover */}
              <div className="absolute left-16 bg-slate-950 text-white text-[10px] py-1 px-2.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-semibold shadow-md">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Sidebar: React.FC<NavProps> = () => {
  const { currentProfile, notifications } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getActiveItem = () => {
    const path = location.pathname;
    if (path === "/stories" || path === "/home") return "stories";
    if (path === "/map") return "map";
    if (path === "/camera") return "camera";
    if (path === "/notifications") return "notifications";
    if (path === "/profile") return "profile";
    if (path === "/dashboard") return "insights";
    if (path === "/admin") return "admin";
    if (path === "/history") return "history";
    if (path === "/chat") return "chat";
    if (path === "/settings") return "settings";
    if (path === "/help") return "help";
    return "";
  };

  const activeItem = getActiveItem();

  const sideItems = [
    { id: "insights", label: "AI Dashboard", icon: <LayoutGrid className="w-5 h-5" />, path: "/dashboard" },
    { id: "stories", label: "Community Feed", icon: <Newspaper className="w-5 h-5" />, path: "/stories" },
    { id: "map", label: "Interactive Heatmap", icon: <Map className="w-5 h-5" />, path: "/map" },
    { id: "camera", label: "Capture / Report", icon: <Camera className="w-5 h-5" />, path: "/camera" },
    { id: "history", label: "My Submissions", icon: <History className="w-5 h-5" />, path: "/history" },
    { id: "notifications", label: "Alerts & Notifications", icon: <Bell className="w-5 h-5" />, badge: unreadCount, path: "/notifications" },
    { id: "chat", label: "AI Chat Assistant", icon: <MessageSquare className="w-5 h-5" />, path: "/chat" },
    { id: "admin", label: "Operations Panel", icon: <Sliders className="w-5 h-5" />, path: "/admin" },
    { id: "settings", label: "App Settings", icon: <Settings className="w-5 h-5" />, path: "/settings" },
    { id: "help", label: "FAQ & Support", icon: <HelpCircle className="w-5 h-5" />, path: "/help" },
    { id: "profile", label: "Citizen Profile", icon: <User className="w-5 h-5" />, path: "/profile" }
  ];

  return (
    <div className="hidden lg:flex flex-col w-64 bg-slate-900 text-white h-screen sticky top-0 border-r border-slate-800 p-5 shrink-0 z-40" id="desktop-sidebar">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 px-2 cursor-pointer" id="sidebar-header" onClick={() => navigate("/stories")}>
        <div className="w-9 h-9 bg-[#FFFC00] rounded-xl flex items-center justify-center shadow-lg font-black text-black text-lg">
          S
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight tracking-tight text-[#FFFC00]">SnapFix AI</h1>
          <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Snap. Report. Resolve</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1" id="sidebar-nav-menu">
        {sideItems.map(item => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? "bg-[#FFFC00] text-black font-semibold shadow-md" 
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
              id={`sidebar-item-${item.id}`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="truncate">{item.label}</span>
              </div>
              {!!item.badge && (
                <span className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                  isActive ? "bg-black text-white" : "bg-[#F44336] text-white"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Summary */}
      <div className="pt-4 border-t border-slate-800 flex items-center gap-3 bg-slate-950/40 p-3 rounded-xl mt-4 cursor-pointer" onClick={() => navigate("/profile")}>
        <img 
          src={currentProfile.avatar_url} 
          alt={currentProfile.name} 
          className="w-10 h-10 rounded-full object-cover border border-slate-700"
        />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-white truncate leading-none mb-1">{currentProfile.name}</span>
          <span className="text-[10px] text-[#FFFC00] font-bold uppercase leading-none truncate">Lvl {currentProfile.level} • {currentProfile.points} XP</span>
        </div>
      </div>
    </div>
  );
};
