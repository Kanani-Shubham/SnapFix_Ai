import React, { useState, useEffect, useRef } from "react";
import { 
  BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams 
} from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { BottomNav, Sidebar, NavigationRail } from "./components/NavigationComponents";
import { TopAppBar } from "./components/TopAppBar";

// Import Screens
import { 
  SplashScreen, OnboardingScreen, LoginScreen, 
  LanguageSelectionScreen, SettingsScreen, HelpSupportScreen 
} from "./features/auth/AuthScreens";
import { 
  CameraSnapScreen, AILiveDetectionScreen, AIAnalysisResultScreen, 
  TrackingProgressScreen, IssueResolutionScreen, BeforeAfterScreen 
} from "./features/reporting/ReportingScreens";
import { 
  CommunityStoriesScreen, CommentsScreen, MapViewScreen, 
  NearbyIssuesScreen, SearchFiltersScreen, AIChatAssistantScreen 
} from "./features/community/CommunityScreens";
import { 
  IssueDetailsScreen, NotificationsScreen, LeaderboardScreen, 
  ProfileScreen, AIInsightsScreen, ReportHistoryScreen, 
  AdminDashboardScreen, AIAgentsWorkflowScreen, SmartRoutingScreen, 
  GamificationBadgesScreen 
} from "./features/dashboard/DashboardScreens";
import { EmptyState, NoInternetState, OfflineSuccessState } from "./features/utility/UtilityScreens";

// Lucide icons for the Desktop Right Panel and Layout
import { 
  Bell, Send, ArrowUpRight, ShieldAlert, Sparkles, Plus, 
  CheckCircle2, Clock, ThumbsUp, AlertTriangle, MessageSquare, MapPin 
} from "lucide-react";

// Helper function to map paths to active screen keys for nav states & titles
const getScreenKey = (pathname: string): string => {
  if (pathname === "/") return "splash";
  if (pathname === "/onboarding") return "onboarding";
  if (pathname === "/login") return "login";
  if (pathname === "/stories" || pathname === "/home") return "stories";
  if (pathname === "/map") return "map";
  if (pathname === "/camera") return "camera";
  if (pathname === "/ai-detect") return "ai-detect";
  if (pathname === "/ai-result") return "ai-result";
  if (pathname.startsWith("/report/")) return "details";
  if (pathname === "/comments") return "comments";
  if (pathname === "/before-after") return "before-after";
  if (pathname === "/leaderboard") return "leaderboard";
  if (pathname === "/profile") return "profile";
  if (pathname === "/notifications") return "notifications";
  if (pathname === "/history") return "history";
  if (pathname === "/dashboard") return "insights";
  if (pathname === "/settings") return "settings";
  if (pathname === "/help") return "help";
  if (pathname === "/chat") return "chat";
  if (pathname === "/search") return "filters";
  if (pathname === "/language") return "language";
  if (pathname === "/admin") return "admin";
  if (pathname === "/workflow") return "workflow";
  if (pathname === "/routing") return "routing";
  if (pathname === "/progress") return "progress";
  if (pathname === "/resolution") return "resolution";
  if (pathname === "/badges") return "badges";
  if (pathname === "/empty") return "empty";
  if (pathname === "/no-internet") return "no-internet";
  if (pathname === "/offline-success") return "offline-success";
  return "";
};

const getScreenTitle = (screenKey: string): string => {
  switch (screenKey) {
    case "details": return "Issue Details";
    case "comments": return "Discussions";
    case "history": return "My Submissions";
    case "badges": return "My Badges";
    case "settings": return "App Preferences";
    case "help": return "FAQ & Help";
    case "chat": return "AI Chat Assistant";
    case "before-after": return "Before & After";
    case "routing": return "Smart Routing Code";
    case "progress": return "Tracking Details";
    case "workflow": return "AI Pipeline Log";
    case "ai-result": return "AI Verification";
    case "filters": return "Search Filters";
    case "nearby": return "Proximity Issues";
    default: return "SnapFix AI";
  }
};

// Global Routing Bridge Adaptor
// Translates old string navigation calls (onNavigate) to React Router actions
export const useNavigationBridge = () => {
  const navigate = useNavigate();
  return (screenId: string) => {
    switch (screenId) {
      case "splash": navigate("/"); break;
      case "onboarding": navigate("/onboarding"); break;
      case "login": navigate("/login"); break;
      case "stories": navigate("/stories"); break;
      case "map": navigate("/map"); break;
      case "camera": navigate("/camera"); break;
      case "ai-detect": navigate("/ai-detect"); break;
      case "ai-result": navigate("/ai-result"); break;
      case "details": navigate("/report/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"); break; // fallback or default report
      case "notifications": navigate("/notifications"); break;
      case "leaderboard": navigate("/leaderboard"); break;
      case "profile": navigate("/profile"); break;
      case "insights": navigate("/dashboard"); break;
      case "history": navigate("/history"); break;
      case "admin": navigate("/admin"); break;
      case "workflow": navigate("/workflow"); break;
      case "comments": navigate("/comments"); break;
      case "before-after": navigate("/before-after"); break;
      case "nearby": navigate("/nearby"); break;
      case "routing": navigate("/routing"); break;
      case "progress": navigate("/progress"); break;
      case "resolution": navigate("/resolution"); break;
      case "badges": navigate("/badges"); break;
      case "filters": navigate("/search"); break;
      case "language": navigate("/language"); break;
      case "settings": navigate("/settings"); break;
      case "help": navigate("/help"); break;
      case "chat": navigate("/chat"); break;
      case "empty": navigate("/empty"); break;
      case "no-internet": navigate("/no-internet"); break;
      case "offline-success": navigate("/offline-success"); break;
      default: navigate("/stories"); break;
    }
  };
};

// Desktop Right Panel Component containing Quick Actions, Alert Ticker, and Interactive AI Chat Widget
const DesktopRightPanel: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, reports } = useApp();
  const [miniText, setMiniText] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string; link?: string; linkLabel?: string }>>([
    { sender: "ai", text: "Hi Shubham! I'm your active civic helper. How can I assist you right now?" }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMiniSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!miniText.trim()) return;

    const userMsg = miniText;
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setMiniText("");

    // Simulate Server Side Gemini agent parser logic for immediate response
    setTimeout(() => {
      let reply = "I analyzed your query. You can captures potholes, check resolutions or inspect recent analytics directly!";
      let linkPath: string | undefined;
      let label: string | undefined;

      const q = userMsg.toLowerCase();
      if (q.includes("pothole") || q.includes("jamnagar")) {
        reply = "There's an active high-severity Pothole reported in Jamnagar. 10 citizens have verified it.";
        linkPath = "/report/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
        label = "Review Report Details";
      } else if (q.includes("leaderboard") || q.includes("points") || q.includes("xp")) {
        reply = "You currently hold 420 XP (Level 12). Check out the top citizen ranks in town.";
        linkPath = "/leaderboard";
        label = "View Leaderboard";
      } else if (q.includes("map") || q.includes("heatmap")) {
        reply = "I've loaded the interactive urban heatmap. Check active hotspots near Sector 3.";
        linkPath = "/map";
        label = "Open Heatmap";
      }

      setMessages(prev => [...prev, { sender: "ai", text: reply, link: linkPath, linkLabel: label }]);
    }, 900);
  };

  // Get top 2 unread notifications
  const recentAlerts = notifications.slice(0, 2);

  return (
    <div className="hidden xl:flex flex-col w-80 h-screen sticky top-0 border-l border-slate-150 bg-slate-50 p-5 shrink-0 z-40 gap-5 overflow-y-auto" id="desktop-right-panel">
      
      {/* Quick Actions Panel */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 leading-none mb-1">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => navigate("/camera")}
            className="p-3 bg-[#FFFC00] hover:bg-yellow-300 text-black rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Report Issue</span>
          </button>
          <button 
            onClick={() => navigate("/map")}
            className="p-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <MapPin className="w-4 h-4 text-[#00BCD4]" />
            <span>Open Map</span>
          </button>
        </div>
      </div>

      {/* Citizen Alerts Inbox Ticker */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Recent Alerts</h3>
          <button onClick={() => navigate("/notifications")} className="text-[10px] text-blue-600 font-bold hover:underline">View All</button>
        </div>
        <div className="flex flex-col gap-2">
          {recentAlerts.map(alert => (
            <div 
              key={alert.id}
              onClick={() => navigate("/notifications")}
              className={`p-3 bg-white border rounded-xl shadow-xs flex items-start gap-2.5 cursor-pointer hover:border-slate-300 transition-colors ${
                alert.is_read ? "border-slate-150 opacity-80" : "border-yellow-200 bg-yellow-50/10"
              }`}
            >
              <div className="p-1.5 rounded-full bg-slate-100 text-[#FF9800] shrink-0">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[11px] font-bold text-slate-800 truncate leading-tight">{alert.title}</h4>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Active Gemini Assistant Chat */}
      <div className="flex-1 flex flex-col justify-between bg-white border border-slate-150 rounded-2xl p-4 shadow-sm min-h-[220px]">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#9C27B0]" />
            <span className="text-xs font-bold text-slate-800">Quick Gemini Chat</span>
          </div>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[140px] pr-1" id="mini-chat-feed">
            {messages.map((msg, idx) => {
              const isUser = msg.sender === "user";
              return (
                <div key={idx} className={`flex flex-col max-w-[90%] ${isUser ? "self-end items-end" : "self-start items-start"}`}>
                  <div className={`p-2.5 rounded-xl text-[11px] leading-snug ${
                    isUser ? "bg-[#FFFC00] text-black font-medium" : "bg-slate-50 text-slate-700 border border-slate-100"
                  }`}>
                    {msg.text}
                  </div>
                  {msg.link && (
                    <button 
                      onClick={() => navigate(msg.link!)}
                      className="mt-1 bg-slate-900 text-[#FFFC00] font-bold text-[9px] px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs uppercase tracking-wider"
                    >
                      <span>{msg.linkLabel}</span>
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        </div>

        <form onSubmit={handleMiniSend} className="flex gap-1.5 items-center border-t border-slate-100 pt-2.5 mt-2">
          <input 
            type="text"
            value={miniText}
            onChange={e => setMiniText(e.target.value)}
            placeholder="Ask Gemini..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-black text-slate-800"
          />
          <button 
            type="submit"
            className="p-2 bg-black text-[#FFFC00] rounded-lg shadow-sm hover:bg-slate-800 transition-all"
            aria-label="Send"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

// Main Layout component wrapping all screens
const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const screenKey = getScreenKey(location.pathname);

  const showMobileBottomNav = ["stories", "map", "notifications", "profile", "insights", "admin"].includes(screenKey);
  const showMobileTopBar = ["details", "comments", "history", "badges", "settings", "help", "chat", "before-after", "routing", "progress", "workflow", "ai-result", "filters", "nearby"].includes(screenKey);

  const isEdgeToEdge = ["map", "camera"].includes(screenKey);

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans" id="app-root-shell">
      {/* 1. Left Sidebar Navigation (visible on Desktop >= lg) */}
      <Sidebar />

      {/* 2. Left Tablet Navigation Rail (visible on Tablet >= md and < lg) */}
      <NavigationRail />

      {/* 3. Main content viewport area */}
      <div className="flex-1 flex flex-col min-w-0" id="main-viewport-wrapper">
        
        {/* Mobile top bar (only visible on mobile screens < md when requested) */}
        {showMobileTopBar && (
          <div className="md:hidden">
            <TopAppBar title={getScreenTitle(screenKey)} onBack={() => navigate(-1)} />
          </div>
        )}

        {/* Dynamic Screen Content Wrapper with edge-to-edge on mobile */}
        <div className={`flex-1 ${isEdgeToEdge ? "overflow-hidden h-[calc(100vh-4rem)] md:h-screen" : "overflow-y-auto pb-16 md:pb-0"}`} id="screen-viewport">
          <div className={isEdgeToEdge ? "w-full h-full" : "mx-auto w-full max-w-5xl md:p-6 lg:p-8"}>
            <Routes>
              {/* Home Route redirects to stories */}
              <Route path="/home" element={<Navigate to="/stories" replace />} />
              
              {/* Feature Screens */}
              <Route path="/stories" element={<RouteScreenWrapper><CommunityStoriesScreen /></RouteScreenWrapper>} />
              <Route path="/map" element={<RouteScreenWrapper><MapViewScreen /></RouteScreenWrapper>} />
              <Route path="/camera" element={<RouteScreenWrapper><CameraSnapScreen /></RouteScreenWrapper>} />
              <Route path="/ai-detect" element={<RouteScreenWrapper><AILiveDetectionScreen /></RouteScreenWrapper>} />
              <Route path="/ai-result" element={<RouteScreenWrapper><AIAnalysisResultScreen /></RouteScreenWrapper>} />
              <Route path="/report/:id" element={<IssueDetailsRoute />} />
              <Route path="/comments" element={<RouteScreenWrapper><CommentsScreen /></RouteScreenWrapper>} />
              <Route path="/before-after" element={<RouteScreenWrapper><BeforeAfterScreen /></RouteScreenWrapper>} />
              <Route path="/leaderboard" element={<RouteScreenWrapper><LeaderboardScreen /></RouteScreenWrapper>} />
              <Route path="/profile" element={<RouteScreenWrapper><ProfileScreen /></RouteScreenWrapper>} />
              <Route path="/notifications" element={<RouteScreenWrapper><NotificationsScreen /></RouteScreenWrapper>} />
              <Route path="/history" element={<RouteScreenWrapper><ReportHistoryScreen /></RouteScreenWrapper>} />
              <Route path="/dashboard" element={<RouteScreenWrapper><AIInsightsScreen /></RouteScreenWrapper>} />
              <Route path="/settings" element={<RouteScreenWrapper><SettingsScreen /></RouteScreenWrapper>} />
              <Route path="/help" element={<RouteScreenWrapper><HelpSupportScreen /></RouteScreenWrapper>} />
              <Route path="/chat" element={<RouteScreenWrapper><AIChatAssistantScreen /></RouteScreenWrapper>} />
              <Route path="/search" element={<RouteScreenWrapper><SearchFiltersScreen /></RouteScreenWrapper>} />
              <Route path="/language" element={<RouteScreenWrapper><LanguageSelectionScreen /></RouteScreenWrapper>} />
              <Route path="/admin" element={<RouteScreenWrapper><AdminDashboardScreen /></RouteScreenWrapper>} />
              <Route path="/workflow" element={<RouteScreenWrapper><AIAgentsWorkflowScreen /></RouteScreenWrapper>} />
              <Route path="/routing" element={<RouteScreenWrapper><SmartRoutingScreen /></RouteScreenWrapper>} />
              <Route path="/progress" element={<RouteScreenWrapper><TrackingProgressScreen /></RouteScreenWrapper>} />
              <Route path="/resolution" element={<RouteScreenWrapper><IssueResolutionScreen /></RouteScreenWrapper>} />
              <Route path="/badges" element={<RouteScreenWrapper><GamificationBadgesScreen /></RouteScreenWrapper>} />
              <Route path="/nearby" element={<RouteScreenWrapper><NearbyIssuesScreen /></RouteScreenWrapper>} />
              
              {/* Utility states */}
              <Route path="/empty" element={<EmptyState onResetFilters={() => navigate("/stories")} />} />
              <Route path="/no-internet" element={<NoInternetState onAction={() => navigate("/stories")} />} />
              <Route path="/offline-success" element={<OfflineSuccessState onViewReports={() => navigate("/history")} />} />
            </Routes>
          </div>
        </div>

        {/* Mobile bottom bar navigation (visible on mobile screens < md when requested) */}
        {showMobileBottomNav && (
          <BottomNav />
        )}
      </div>

      {/* 4. Desktop Right Panel (visible on Desktop >= xl) */}
      <DesktopRightPanel />
    </div>
  );
};

// Dynamic Issue Details router handler with route parameters parsing
const IssueDetailsRoute = () => {
  const { id } = useParams();
  const onNavigate = useNavigationBridge();
  return <IssueDetailsScreen onNavigate={onNavigate} reportId={id} />;
};

// Screen Wrapper component to inject standard navigation bridges and states
const RouteScreenWrapper: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const onNavigate = useNavigationBridge();
  const [reportId, setReportId] = useState("a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d");

  return React.cloneElement(children, {
    onNavigate,
    reportId,
    setReportId
  });
};

function MainAppContent() {
  const onNavigate = useNavigationBridge();

  return (
    <Routes>
      {/* Absolute root redirects straight to splash */}
      <Route path="/" element={<SplashScreen onNavigate={onNavigate} />} />
      <Route path="/onboarding" element={<OnboardingScreen onNavigate={onNavigate} />} />
      <Route path="/login" element={<LoginScreen onNavigate={onNavigate} />} />

      {/* All subsequent routes fall under the standard Responsive App Shell */}
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <MainAppContent />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
