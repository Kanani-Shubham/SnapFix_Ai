import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../../context/AppContext";
import { IssueCategory, ReportStatus, SeverityLevel, Comment } from "../../types";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Supercluster from "supercluster";
import { 
  Search, MapPin, SlidersHorizontal, MessageSquare, ThumbsUp, Send, 
  Map as MapIcon, Sparkles, Filter, CornerDownRight, Check, X, ArrowLeft, ArrowUpRight,
  Plus as PlusIcon, Minus as MinusIcon, Navigation,
  AlertTriangle, Trash2, Droplets, Lightbulb, TrafficCone, Footprints, ShieldAlert, HelpCircle, RefreshCw
} from "lucide-react";
import { SeverityBadge, StatusBadge } from "../../components/BadgeComponents";
import { ReportCard } from "../../components/ReportCard";
import { EmptyState } from "../utility/UtilityScreens";

interface ScreenProps {
  onNavigate: (screenId: string) => void;
  reportId?: string;
  setReportId?: (id: string) => void;
}

// 7. Community Stories Feed
export const CommunityStoriesScreen: React.FC<ScreenProps> = ({ onNavigate, setReportId }) => {
  const { reports, stories, simulatedState } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Potholes", "Garbage", "Water", "Streetlight"];

  const filteredReports = activeCategory === "All" 
    ? reports 
    : reports.filter(r => r.category === activeCategory);

  const handleViewReport = (id: string) => {
    if (setReportId) setReportId(id);
    onNavigate("details");
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-50 min-h-[500px]" id="stories-screen">
      {/* Top Search & Filter Strip */}
      <div className="flex gap-2.5 items-center">
        <div className="flex-1 bg-white border border-slate-150 rounded-full py-2.5 px-4 flex items-center gap-2 shadow-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search reports, places..." 
            className="text-xs focus:outline-none w-full bg-transparent text-slate-800"
            onClick={() => onNavigate("filters")}
          />
        </div>
        <button 
          onClick={() => onNavigate("filters")}
          className="p-3 bg-white border border-slate-150 rounded-full shadow-sm hover:bg-slate-50 text-slate-600 transition-colors"
          id="filter-trigger-btn"
          aria-label="Filter"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Stories horizontal carousel (Mocking Snapchat layout) */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest pl-1 leading-none mb-1">Local Snaps</h3>
        <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none" id="stories-carousel">
          {/* Add story button */}
          <div className="flex flex-col items-center shrink-0">
            <button 
              onClick={() => onNavigate("camera")}
              className="w-14 h-14 bg-black text-[#FFFC00] rounded-full flex items-center justify-center border-2 border-dashed border-slate-350 active:scale-95 transition-all shadow-sm"
              id="add-story-btn"
            >
              <Plus className="w-5 h-5" />
            </button>
            <span className="text-[10px] text-slate-500 font-semibold mt-1.5 leading-none">Add Snap</span>
          </div>

          {stories.map(story => (
            <div key={story.id} className="flex flex-col items-center shrink-0 cursor-pointer">
              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#FFFC00] via-[#FF9800] to-[#9C27B0]">
                <img 
                  src={story.profile_avatar} 
                  alt={story.profile_name} 
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[10px] text-slate-600 font-medium mt-1.5 leading-none truncate max-w-[56px]">{story.profile_name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Chips Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" id="category-filter-scroll">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeCategory === cat 
                ? "bg-black text-[#FFFC00]" 
                : "bg-white text-slate-600 border border-slate-150 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading, Empty, Error and Success States visualization */}
      {simulatedState === "loading" ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFFC00]" />
          <span className="text-xs text-slate-500 font-semibold">Fetching community reports...</span>
        </div>
      ) : simulatedState === "empty" || filteredReports.length === 0 ? (
        <EmptyState onResetFilters={() => setActiveCategory("All")} />
      ) : (
        /* Report Cards List Feed */
        <div className="flex flex-col gap-4 mt-1" id="report-feed-list">
          {filteredReports.map(report => (
            <ReportCard 
              key={report.id} 
              report={report} 
              onViewDetails={handleViewReport} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Plus = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const Loader2 = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// 17. Comments & Community Screen
export const CommentsScreen: React.FC<ScreenProps> = ({ onNavigate, reportId }) => {
  const { comments, addComment } = useApp();
  const [commentText, setCommentText] = useState("");

  const filteredComments = comments.filter(c => c.report_id === reportId || c.report_id === "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d");

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(reportId || "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d", commentText);
    setCommentText("");
  };

  return (
    <div className="flex flex-col justify-between p-5 bg-white min-h-[500px]" id="comments-screen">
      <div className="flex flex-col gap-4 flex-1">
        <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest pl-1 leading-none mb-1">
          Discussion Board ({filteredComments.length} Comments)
        </h3>

        {/* Comment rows */}
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-1" id="comments-list">
          {filteredComments.map(comm => (
            <div key={comm.id} className="flex gap-3 items-start border-b border-slate-50 pb-3" id={`comment-${comm.id}`}>
              <img 
                src={comm.profile_avatar} 
                alt={comm.profile_name} 
                className="w-8 h-8 rounded-full object-cover border border-slate-100 mt-0.5 shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{comm.profile_name}</span>
                  <span className="text-[9px] text-slate-400">1h ago</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{comm.content}</p>
                <div className="flex items-center gap-3.5 mt-2">
                  <button className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-black font-semibold">
                    <ThumbsUp className="w-3 h-3" />
                    <span>Like ({comm.likes_count})</span>
                  </button>
                  <button className="text-[10px] text-slate-400 hover:text-black font-semibold">Reply</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input panel bottom */}
      <form onSubmit={handleSubmitComment} className="flex gap-2 items-center border-t border-slate-100 pt-3 mt-4" id="comment-form">
        <input 
          type="text" 
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder="Add a comment to this report..." 
          className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black text-slate-800"
        />
        <button 
          type="submit"
          className="p-2.5 bg-[#FFFC00] text-black rounded-full shadow-md hover:bg-yellow-300 active:scale-95 transition-all"
          id="send-comment-btn"
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

// 8. Map / Heatmap View Screen
const getCategoryIconSvg = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes("road") || cat.includes("pothole") || cat.includes("damage")) {
    return `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
  }
  if (cat.includes("garbage") || cat.includes("dump") || cat.includes("refuse")) {
    return `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`;
  }
  if (cat.includes("water") || cat.includes("leak") || cat.includes("pipe")) {
    return `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.25c-5.25 5.25-6.75 9-6.75 12.25a6.75 6.75 0 0013.5 0c0-3.25-1.5-7-6.75-12.25z"/></svg>`;
  }
  if (cat.includes("light") || cat.includes("lamp") || cat.includes("street")) {
    return `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`;
  }
  if (cat.includes("drain") || cat.includes("sewer")) {
    return `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2.25c-5.25 5.25-6.75 9-6.75 12.25a6.75 6.75 0 0013.5 0c0-3.25-1.5-7-6.75-12.25z"/></svg>`;
  }
  if (cat.includes("traffic") || cat.includes("hazard")) {
    return `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
  }
  if (cat.includes("animal")) {
    return `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11a13.917 13.917 0 00-2.3-7.5l-.011-.018M12 11c0-3.517 1.009-6.799 2.753-9.571m3.44 2.04l-.054.09A13.916 13.916 0 0015 11a13.917 13.917 0 002.3 7.5l.011.018M12 11V22"/></svg>`;
  }
  return `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
};

const MapControls = ({ 
  onZoomIn, 
  onZoomOut, 
  onCenterOnMe 
}: { 
  onZoomIn: () => void; 
  onZoomOut: () => void; 
  onCenterOnMe: () => void; 
}) => {
  return (
    <div className="absolute right-4 bottom-64 md:bottom-28 z-10 flex flex-col gap-2 shadow-lg" id="map-custom-controls">
      <button 
        onClick={onZoomIn}
        className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-800 rounded-xl flex items-center justify-center border border-slate-200 shadow-md transition-all font-bold text-lg active:scale-95 cursor-pointer"
        aria-label="Zoom In"
        id="map-zoom-in"
      >
        <PlusIcon className="w-5 h-5 text-slate-700" />
      </button>
      <button 
        onClick={onZoomOut}
        className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-800 rounded-xl flex items-center justify-center border border-slate-200 shadow-md transition-all font-bold text-lg active:scale-95 cursor-pointer"
        aria-label="Zoom Out"
        id="map-zoom-out"
      >
        <MinusIcon className="w-5 h-5 text-slate-700" />
      </button>
      <button 
        onClick={onCenterOnMe}
        className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-800 rounded-xl flex items-center justify-center border border-slate-200 shadow-md transition-all active:scale-95 cursor-pointer"
        aria-label="Center on Location"
        id="map-center-on-me"
      >
        <Navigation className="w-4 h-4 text-sky-500 fill-sky-500/10" />
      </button>
    </div>
  );
};

export const MapViewScreen: React.FC<ScreenProps> = ({ onNavigate, setReportId }) => {
  const { reports } = useApp();
  const [activeLayer, setActiveLayer] = useState<"marker" | "heatmap" | "both">("marker");
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Search autocomplete states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categories = ["All", "Potholes", "Garbage", "Water", "Streetlight"];

  const filteredReports = useMemo(() => {
    return selectedCat === "All" 
      ? reports 
      : reports.filter(r => r.category.toLowerCase().includes(selectedCat.slice(0, 4).toLowerCase()));
  }, [reports, selectedCat]);

  const [zoom, setZoom] = useState<number>(12.5);
  const [bounds, setBounds] = useState<[number, number, number, number]>([
    69.8, 22.3, 70.3, 22.6
  ]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const activeMarkersRef = useRef<maplibregl.Marker[]>([]);
  const lastSelectedCatRef = useRef<string | null>(null);
  const lastReportsLengthRef = useRef<number>(0);

  // Fetch current GPS coordinates for live location tracking
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setUserCoords(coords);
          if (mapRef.current) {
            mapRef.current.easeTo({
              center: [coords.lng, coords.lat],
              zoom: 13.5,
              duration: 1000
            });
          }
        },
        (err) => console.log("User geolocation declined or unavailable:", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://tiles.openfreemap.org/styles/positron",
      center: [70.0577, 22.4707],
      zoom: 12.5,
      pitch: 20
    });

    // Suppress benign missing sprite/image/tile errors from openfreemap style definition
    map.on("error", (e: any) => {
      const msg = e.error?.message || e.message || "";
      if (
        msg.includes("sprite") || 
        msg.includes("Image") || 
        msg.includes("image") || 
        msg.includes("loading")
      ) {
        return; // ignore expected/benign missing sprites or tiles
      }
      console.warn("MapLibre map error:", e);
    });

    mapRef.current = map;

    map.on("load", () => {
      const b = map.getBounds();
      if (b) {
        setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
        setZoom(map.getZoom());
      }
    });

    map.on("moveend", () => {
      const b = map.getBounds();
      if (b) {
        setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
        setZoom(map.getZoom());
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fit bounds when reports change (guarded against infinite loop with tracking refs)
  useEffect(() => {
    const map = mapRef.current;
    if (filteredReports.length > 0 && map) {
      if (lastSelectedCatRef.current !== selectedCat || lastReportsLengthRef.current !== filteredReports.length) {
        lastSelectedCatRef.current = selectedCat;
        lastReportsLengthRef.current = filteredReports.length;
        try {
          let minLat = 90;
          let maxLat = -90;
          let minLng = 180;
          let maxLng = -180;
          
          filteredReports.forEach(r => {
            const lat = parseFloat(r.latitude as any) || 22.4707;
            const lng = parseFloat(r.longitude as any) || 70.0577;
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
          });

          const latDiff = maxLat - minLat;
          const lngDiff = maxLng - minLng;
          const padLat = latDiff > 0 ? latDiff * 0.15 : 0.01;
          const padLng = lngDiff > 0 ? lngDiff * 0.15 : 0.01;

          map.fitBounds([
            [minLng - padLng, minLat - padLat], // SW
            [maxLng + padLng, maxLat + padLat]  // NE
          ], { padding: 60, duration: 800 });
        } catch (err) {
          console.warn("Could not fit bounds on MapLibre map", err);
        }
      }
    }
  }, [filteredReports, selectedCat]);

  // Handle OSM search change with autocomplete suggestions
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&limit=5`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "SnapFixAI-App"
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setSearchResults(data);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error("OSM Geocoding search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    if (!isNaN(lat) && !isNaN(lon) && mapRef.current) {
      mapRef.current.easeTo({
        center: [lon, lat],
        zoom: 15,
        duration: 1000
      });
      setSearchQuery(result.display_name);
      setShowSuggestions(false);
    }
  };

  // Convert filteredReports into GeoJSON points for Supercluster
  const points = useMemo(() => {
    return filteredReports.map((report) => ({
      type: "Feature" as const,
      properties: {
        cluster: false,
        reportId: report.id,
        category: report.category,
        severity: report.severity,
        status: report.status,
        report: report
      },
      geometry: {
        type: "Point" as const,
        coordinates: [
          parseFloat(report.longitude as any) || 70.0577,
          parseFloat(report.latitude as any) || 22.4707
        ]
      }
    }));
  }, [filteredReports]);

  // Initialize Supercluster
  const superclusterIndex = useMemo(() => {
    const sc = new Supercluster({
      radius: 45,
      maxZoom: 16
    });
    sc.load(points);
    return sc;
  }, [points]);

  // Get active clusters for the current viewport bounds
  const clusters = useMemo(() => {
    return superclusterIndex.getClusters(bounds, Math.round(zoom));
  }, [superclusterIndex, bounds, zoom]);

  // Render Clustered Markers Layer & Pulsing User Location
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    activeMarkersRef.current.forEach(m => m.remove());
    activeMarkersRef.current = [];

    if (activeLayer === "marker" || activeLayer === "both") {
      clusters.forEach((cluster, idx) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount } = cluster.properties;

        const el = document.createElement("div");

        if (isCluster) {
          const size = 32 + Math.min(pointCount * 1.5, 18);
          el.className = "flex items-center justify-center rounded-full bg-slate-900 border-2 border-white text-[#FFFC00] font-extrabold shadow-2xl cursor-pointer active:scale-95 hover:scale-105 transition-all";
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
          el.style.fontSize = "11px";
          el.innerHTML = `<span>${pointCount}</span>`;

          el.addEventListener("click", () => {
            try {
              const expansionZoom = Math.min(
                superclusterIndex.getClusterExpansionZoom(cluster.id),
                18
              );
              map.easeTo({
                center: [longitude, latitude],
                zoom: expansionZoom,
                duration: 800
              });
            } catch (err) {
              map.easeTo({
                center: [longitude, latitude],
                zoom: map.getZoom() + 2,
                duration: 800
              });
            }
          });
        } else {
          const rep = cluster.properties.report;
          const isCritical =
            rep.severity === SeverityLevel.HIGH || rep.severity === SeverityLevel.CRITICAL;
          
          const pinColorClass = rep.severity === SeverityLevel.CRITICAL
            ? "bg-purple-600 ring-purple-400"
            : isCritical
            ? "bg-red-600 ring-red-400"
            : rep.severity === SeverityLevel.MEDIUM
            ? "bg-orange-500 ring-orange-300"
            : "bg-emerald-500 ring-emerald-300";

          el.className = `w-9 h-9 ${pinColorClass} ring-4 ring-offset-2 ring-offset-white text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer`;
          el.id = `marker-trigger-${rep.id}`;
          
          el.innerHTML = getCategoryIconSvg(rep.category);

          el.addEventListener("click", () => {
            setActiveReport(rep);
          });
        }

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(map);

        activeMarkersRef.current.push(marker);
      });
    }

    // Add Live User pulsing Marker
    if (userCoords) {
      const el = document.createElement("div");
      el.className = "relative flex items-center justify-center pointer-events-none";
      el.innerHTML = `
        <div class="absolute w-8 h-8 rounded-full bg-blue-500/25 animate-ping"></div>
        <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg"></div>
      `;
      const userMarker = new maplibregl.Marker({ element: el })
        .setLngLat([userCoords.lng, userCoords.lat])
        .addTo(map);

      activeMarkersRef.current.push(userMarker);
    }
  }, [clusters, activeLayer, userCoords]);

  // Update Heatmap Vector Source & Layer
  const updateHeatmapLayer = (mapInstance: maplibregl.Map) => {
    if (mapInstance.getLayer("heatmap-layer")) {
      mapInstance.removeLayer("heatmap-layer");
    }
    if (mapInstance.getSource("heatmap-source")) {
      mapInstance.removeSource("heatmap-source");
    }

    if (activeLayer === "heatmap" || activeLayer === "both") {
      const geojson = {
        type: "FeatureCollection",
        features: filteredReports.map(report => ({
          type: "Feature",
          properties: {
            ai_impact_score: parseFloat(report.ai_impact_score as any) || 5.0,
            severity: report.severity
          },
          geometry: {
            type: "Point",
            coordinates: [
              parseFloat(report.longitude as any) || 70.0577,
              parseFloat(report.latitude as any) || 22.4707
            ]
          }
        }))
      };

      mapInstance.addSource("heatmap-source", {
        type: "geojson",
        data: geojson as any
      });

      mapInstance.addLayer({
        id: "heatmap-layer",
        type: "heatmap",
        source: "heatmap-source",
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'ai_impact_score'],
            0, 0,
            10, 1.5
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            15, 3.5
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',
            0.2, 'rgba(56, 189, 248, 0.4)',  // sky blue
            0.4, 'rgba(59, 130, 246, 0.6)',  // blue
            0.6, 'rgba(234, 179, 8, 0.75)',  // yellow
            0.8, 'rgba(249, 115, 22, 0.85)', // orange
            1.0, 'rgba(239, 68, 68, 0.95)'   // red
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 3,
            15, 22
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14, 0.95,
            16, 0
          ]
        } as any
      });
    }
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleStyleLoad = () => {
      updateHeatmapLayer(map);
    };

    if (map.isStyleLoaded()) {
      updateHeatmapLayer(map);
    } else {
      map.on("style.load", handleStyleLoad);
    }

    return () => {
      map.off("style.load", handleStyleLoad);
    };
  }, [filteredReports, activeLayer, bounds]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.easeTo({
        zoom: Math.min(mapRef.current.getZoom() + 1, 20),
        duration: 300
      });
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.easeTo({
        zoom: Math.max(mapRef.current.getZoom() - 1, 1),
        duration: 300
      });
    }
  };

  const handleCenterOnMe = () => {
    if (mapRef.current) {
      if (userCoords) {
        mapRef.current.easeTo({
          center: [userCoords.lng, userCoords.lat],
          zoom: 15.5,
          duration: 1000
        });
      } else {
        mapRef.current.easeTo({
          center: [70.0577, 22.4707],
          zoom: 13,
          duration: 1000
        });
      }
    }
  };

  return (
    <div className="w-full h-full relative bg-slate-100 flex flex-col overflow-hidden" id="map-workspace-root">
      
      {/* 1. Floating Top Header with Area Search & Filtering */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-2.5 max-w-lg md:max-w-md pointer-events-auto" id="map-search-filters">
        <div className="flex gap-2 relative">
          <div className="flex-1 bg-white border border-slate-150 rounded-2xl py-3 px-4 flex items-center gap-2.5 shadow-lg relative">
            <Search className="w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(searchResults.length > 0)}
              placeholder="Search address, landmark, road..." 
              className="text-xs font-semibold focus:outline-none w-full bg-transparent text-slate-800"
              id="map-area-search-input"
            />
            {isSearching && (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400 shrink-0" />
            )}
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowSuggestions(false);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button 
            onClick={() => onNavigate("filters")}
            className="p-3 bg-white border border-slate-200 rounded-2xl shadow-lg hover:bg-slate-50 text-slate-600 transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
            id="map-filter-btn"
            aria-label="Advanced Filters"
          >
            <Filter className="w-4.5 h-4.5" />
          </button>

          {/* Search autocomplete suggestions list */}
          {showSuggestions && searchResults.length > 0 && (
            <div className="absolute top-14 left-0 right-0 bg-white border border-slate-150 rounded-2xl shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto p-1.5 flex flex-col gap-1">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => selectSearchResult(res)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl flex items-start gap-2 transition-all cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {res.display_name.split(",")[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate leading-tight">
                      {res.display_name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Categories Capsule pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCat(cat);
                setActiveReport(null);
              }}
              className={`px-3.5 py-2 rounded-full text-xs font-extrabold shadow-md border shrink-0 transition-all cursor-pointer active:scale-95 ${
                selectedCat === cat 
                  ? "bg-black text-[#FFFC00] border-black shadow-lg" 
                  : "bg-white/95 backdrop-blur-md text-slate-700 border-slate-100 hover:bg-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive Map Layer using MapLibre GL */}
      <div className="absolute inset-0 z-0 overflow-hidden" id="google-maps-container">
        <div ref={mapContainerRef} className="w-full h-full" id="react-maplibre-container-div" />

        {/* Floating Zoom & Location Controllers */}
        <MapControls 
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onCenterOnMe={handleCenterOnMe}
        />
      </div>

      {/* 3. Sliding Interactive Info Overlay Sheet */}
      <div className="absolute bottom-24 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:w-[400px] z-15 flex flex-col gap-3 pointer-events-auto transition-all" id="map-bottom-overlays">
        <AnimatePresence mode="wait">
          {activeReport ? (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-4 flex flex-col gap-3.5 relative overflow-hidden"
              id="active-report-overlay-card"
            >
              {/* Close Button */}
              <button 
                onClick={() => setActiveReport(null)}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer z-10"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex gap-3">
                {/* Media Thumbnail */}
                <img 
                  src={activeReport.media_url || "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600"} 
                  alt={activeReport.category}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0 self-center shadow-sm"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="text-xs font-extrabold text-slate-900">{activeReport.category}</span>
                      <SeverityBadge severity={activeReport.severity} />
                    </div>
                    <div className="flex items-start gap-1 text-[11px] text-slate-500 mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                      <span className="truncate leading-tight font-semibold">{activeReport.address}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">
                      By {activeReport.reporter_name || "Anonymous Citizen"} • {activeReport.created_at ? new Date(activeReport.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : "Just now"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assigned Department & Status & Action Button */}
              <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 flex-wrap">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Assigned Department</span>
                  <span className="text-[11px] font-bold text-slate-700">{activeReport.department_name || "General Sanitation & Roads"}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={activeReport.status} />
                  <button
                    onClick={() => {
                      if (setReportId) setReportId(activeReport.id);
                      onNavigate("details");
                    }}
                    className="px-3.5 py-2 bg-[#FFFC00] text-black text-[11px] font-extrabold rounded-xl shadow-md hover:bg-yellow-400 transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                    id="track-issue-btn"
                  >
                    <span>Track Issue</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Standard Jamnagar Layer Switcher with Markers, Heatmap, and Both toggles */
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-100 shadow-xl flex items-center justify-between"
              id="map-layer-selector"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-sm leading-tight">Jamnagar Civic Map</h4>
                <span className="text-[10px] text-slate-500 leading-none font-bold">
                  {filteredReports.length} {selectedCat === "All" ? "active" : selectedCat} reports listed nearby
                </span>
              </div>
              
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button 
                  onClick={() => {
                    setActiveLayer("marker");
                    setActiveReport(null);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    activeLayer === "marker" ? "bg-white text-black shadow-sm" : "text-slate-500 hover:text-black"
                  }`}
                  id="toggle-markers-btn"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#00BCD4]" />
                  <span>Markers</span>
                </button>
                <button 
                  onClick={() => {
                    setActiveLayer("heatmap");
                    setActiveReport(null);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    activeLayer === "heatmap" ? "bg-white text-black shadow-sm" : "text-slate-500 hover:text-black"
                  }`}
                  id="toggle-heatmap-btn"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#9C27B0]" />
                  <span>Heat</span>
                </button>
                <button 
                  onClick={() => {
                    setActiveLayer("both");
                    setActiveReport(null);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    activeLayer === "both" ? "bg-white text-black shadow-sm" : "text-slate-500 hover:text-black"
                  }`}
                  id="toggle-both-btn"
                >
                  <MapIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Both</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// 19. Nearby Issues Screen
export const NearbyIssuesScreen: React.FC<ScreenProps> = ({ onNavigate, setReportId }) => {
  const { reports } = useApp();

  const handleView = (id: string) => {
    if (setReportId) setReportId(id);
    onNavigate("details");
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-slate-50 min-h-[500px]" id="nearby-screen">
      <div className="text-center">
        <MapPin className="w-8 h-8 text-[#00BCD4] mx-auto mb-2 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">Nearby Issues</h2>
        <p className="text-slate-500 text-xs mt-1">Hyperlocal reports within 500 meters of your area</p>
      </div>

      <div className="flex flex-col gap-3" id="nearby-list">
        {reports.slice(0, 3).map((rep, idx) => {
          const distances = ["120m away", "230m away", "310m away"];
          return (
            <div 
              key={rep.id} 
              onClick={() => handleView(rep.id)}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
              id={`nearby-item-${rep.id}`}
            >
              <img 
                src={rep.media_url} 
                alt={rep.category} 
                className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">{rep.category}</span>
                  <SeverityBadge severity={rep.severity} />
                </div>
                <p className="text-[11px] text-slate-500 truncate">{rep.address}</p>
                <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 font-bold leading-none">
                  <span className="text-[#00BCD4]">{distances[idx % distances.length]}</span>
                  <span>Verified by {rep.verification_count}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onNavigate("map")}
        className="w-full py-4 bg-[#FFFC00] text-black font-extrabold rounded-full shadow-lg hover:bg-yellow-300 active:scale-95 transition-all text-sm uppercase tracking-wider mt-4"
        id="nearby-map-btn"
      >
        View on Full Map
      </button>
    </div>
  );
};

// 24. Search & Filters Screen
export const SearchFiltersScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [category, setCategory] = useState<string>("All");
  const [severity, setSeverity] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");

  const categories = ["All", "Potholes", "Garbage", "Water", "Streetlight"];
  const severities = ["All", "Low", "Medium", "High", "Critical"];
  const statuses = ["All", "Reported", "In Progress", "Resolved"];

  return (
    <div className="flex flex-col justify-between p-5 bg-white min-h-[500px]" id="filters-screen">
      <div className="flex flex-col gap-5">
        <div className="text-center">
          <Filter className="w-8 h-8 text-black mx-auto mb-2" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Advanced Filters</h2>
          <p className="text-slate-500 text-xs mt-1">Configure search parameters for local issues</p>
        </div>

        {/* Categories chips */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 leading-none">Categories</span>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  category === cat ? "bg-black text-[#FFFC00]" : "bg-slate-50 text-slate-600 border border-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Severity chips */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 leading-none">Severity</span>
          <div className="flex flex-wrap gap-2">
            {severities.map(sev => (
              <button
                key={sev}
                onClick={() => setSeverity(sev)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  severity === sev ? "bg-black text-[#FFFC00]" : "bg-slate-50 text-slate-600 border border-slate-100"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Status chips */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 leading-none">Status</span>
          <div className="flex flex-wrap gap-2">
            {statuses.map(st => (
              <button
                key={st}
                onClick={() => setStatus(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  status === st ? "bg-black text-[#FFFC00]" : "bg-slate-50 text-slate-600 border border-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={() => {
            setCategory("All");
            setSeverity("All");
            setStatus("All");
          }}
          className="flex-1 py-3.5 border border-slate-200 rounded-full font-semibold text-xs text-slate-500 hover:text-black transition-colors"
          id="reset-filters-cta"
        >
          Reset All
        </button>
        <button
          onClick={() => onNavigate("stories")}
          className="flex-1 py-3.5 bg-[#FFFC00] text-black font-extrabold rounded-full shadow-md hover:bg-yellow-300 active:scale-95 transition-all text-xs uppercase tracking-wider"
          id="apply-filters-cta"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

// 28. AI Chat Assistant Screen
export const AIChatAssistantScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string; link?: string; linkLabel?: string }>>([
    { sender: "ai", text: "Hi Shubham! 👋 I'm your SnapFix Assistant. How can I help you today?" }
  ]);
  const [text, setText] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const userMsg = text;
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setText("");

    // Simulate Server Side Gemini agent parser logic
    setTimeout(() => {
      let reply = "I parsed your query, but couldn't find a direct match. You can report potholes or view active resolutions directly!";
      let linkId: string | undefined;
      let label: string | undefined;

      const q = userMsg.toLowerCase();
      if (q.includes("pothole") || q.includes("jamnagar")) {
        reply = "I found an active high-severity Pothole report in Jamnagar City. 10 citizens have already verified this safety hazard.";
        linkId = "details";
        label = "View Jamnagar Pothole Report";
      } else if (q.includes("leaderboard") || q.includes("points") || q.includes("xp")) {
        reply = "You are currently at Level 12 with 420 XP. To climb higher, you can verify reports submitted by others in your neighborhood (+20 XP)!";
        linkId = "leaderboard";
        label = "Check Leaderboard";
      } else if (q.includes("map") || q.includes("heatmap") || q.includes("near")) {
        reply = "You can view the interactive urban heatmap which displays localized reports color-coded by severity.";
        linkId = "map";
        label = "Open City Heatmap";
      }

      setMessages(prev => [...prev, { sender: "ai", text: reply, link: linkId, linkLabel: label }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col justify-between p-4 bg-slate-50 min-h-[500px]" id="chat-screen">
      {/* Messages Feed window */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[350px] p-1" id="chat-messages-container">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === "user";
          return (
            <div 
              key={idx} 
              className={`flex flex-col max-w-[80%] ${isUser ? "self-end items-end" : "self-start items-start"}`}
            >
              <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                isUser 
                  ? "bg-[#FFFC00] text-black font-medium rounded-tr-none" 
                  : "bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm"
              }`}>
                {msg.text}
              </div>
              
              {/* Optional dynamic deep links generated by Gemini */}
              {msg.link && (
                <button
                  onClick={() => onNavigate(msg.link!)}
                  className="mt-1.5 flex items-center gap-1.5 bg-slate-900 hover:bg-black text-[#FFFC00] font-bold text-[10px] px-3 py-1.5 rounded-xl shadow-sm transition-all self-start uppercase tracking-wider"
                >
                  <span>{msg.linkLabel}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Input panel bottom */}
      <form onSubmit={handleSend} className="flex gap-2 items-center border-t border-slate-150 pt-3 mt-4" id="chat-form">
        <input 
          type="text" 
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Ask Gemini: e.g. Show potholes near me..." 
          className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black text-slate-800 shadow-sm"
        />
        <button 
          type="submit"
          className="p-2.5 bg-black text-[#FFFC00] rounded-full shadow-md hover:bg-slate-800 active:scale-95 transition-all"
          id="chat-send-btn"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
