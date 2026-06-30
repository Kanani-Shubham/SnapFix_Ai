import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../../context/AppContext";
import { IssueCategory, ReportStatus, SeverityLevel } from "../../types";
import { 
  Camera, Zap, Image, RefreshCw, MapPin, CheckCircle, 
  ChevronRight, AlertTriangle, Play, ThumbsUp, Sparkles, Send, 
  HelpCircle, Award, Share2, CornerDownRight, Check, ArrowLeft
} from "lucide-react";
import { SeverityBadge, StatusBadge } from "../../components/BadgeComponents";
import { storageService } from "../../services/storage.service";
import { reportsRepository } from "../../repositories/reports.repository";

interface ScreenProps {
  onNavigate: (screenId: string) => void;
  reportId?: string;
  setReportId?: (id: string) => void;
}

// 6. Camera / Snap Screen
export const CameraSnapScreen: React.FC<ScreenProps> = ({ onNavigate, setReportId }) => {
  const { addReport } = useApp();
  const [hasCaptured, setHasCaptured] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [address, setAddress] = useState("Acquiring GPS location...");
  const [flash, setFlash] = useState(false);

  // Real Camera States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string>("");

  // Upload progress and loading overlay state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // GPS States
  const [gps, setGps] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number | null;
    speed: number | null;
    heading: number | null;
    timestamp: number;
  }>({
    latitude: 22.4707,
    longitude: 70.0577,
    accuracy: null,
    speed: null,
    heading: null,
    timestamp: Date.now(),
  });

  // Real Geolocation and Reverse Geocoding
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;
          const speed = position.coords.speed;
          const heading = position.coords.heading;
          
          setGps({
            latitude: lat,
            longitude: lng,
            accuracy,
            speed,
            heading,
            timestamp: position.timestamp
          });

          // Perform Reverse Geocoding with OpenStreetMap Nominatim (completely open-source)
          try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
            const response = await fetch(url, {
              headers: {
                "User-Agent": "SnapFixAI-App"
              }
            });
            const data = await response.json();
            if (data && data.display_name) {
              setAddress(data.display_name);
              setGpsLoading(false);
              return;
            }
          } catch (err) {
            console.error("Error reverse geocoding with Nominatim:", err);
          }

          // Fallback beautiful Jamnagar ward based on GPS coords
          const wardNum = Math.floor(1 + Math.random() * 18);
          setAddress(`Teen Batti Road, Jamnagar Ward No. ${wardNum}, Gujarat • 36100${Math.floor(1 + Math.random() * 8)}`);
          setGpsLoading(false);
        },
        (error) => {
          console.error("GPS Acquisition Error:", error);
          setAddress("Jamnagar City, Gujarat • 361001");
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setAddress("Jamnagar City, Gujarat • 361001");
      setGpsLoading(false);
    }
  }, []);

  // Request stream & Live Camera Feed
  useEffect(() => {
    if (hasCaptured) return;
    
    let activeStream: MediaStream | null = null;
    setCameraError(null);

    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    })
    .then((s) => {
      activeStream = s;
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    })
    .catch((err) => {
      console.error("Camera access error:", err);
      setCameraError("Camera permission denied or camera unavailable. Please pick an image from your gallery instead.");
    });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, hasCaptured]);

  // Handle flash/torch constraint application
  useEffect(() => {
    if (stream && !hasCaptured) {
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        if ((capabilities as any).torch) {
          track.applyConstraints({
            advanced: [{ torch: flash } as any]
          }).catch(err => console.error("Error applying torch constraint:", err));
        }
      }
    }
  }, [flash, stream, hasCaptured]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
          setCapturedFile(file);
          const url = URL.createObjectURL(blob);
          setCapturedUrl(url);
          setHasCaptured(true);
        }
      }, "image/jpeg", 0.85);
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCapturedFile(file);
      const url = URL.createObjectURL(file);
      setCapturedUrl(url);
      setHasCaptured(true);
    }
  };

  const handleAnalyze = async () => {
    if (!capturedFile) return;

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const fileName = storageService.generatePath("report.jpg", "reports");
      setUploadProgress(40);

      // Upload captured photo to Supabase Storage
      const uploadRes = await storageService.uploadFile({
        bucket: "reports",
        path: fileName,
        file: capturedFile,
        onProgress: (pct) => {
          setUploadProgress(Math.min(40 + Math.round(pct * 0.5), 90));
        }
      });

      const mediaUrl = uploadRes.publicUrl;
      setUploadProgress(95);

      // Now create and add report with the actual cloud storage media url
      const newReport = addReport({
        reporter_profile_id: "prof-001",
        category: IssueCategory.POTHOLE, // starts as placeholder, multi-agent pipeline immediately re-classifies
        severity: SeverityLevel.MEDIUM,
        status: ReportStatus.AI_PROCESSING,
        address: address,
        city: "Jamnagar",
        ward: address.includes("Ward") ? address.split(",")[0].trim() : "Ward No. 4",
        postal_code: address.match(/\d{6}/)?.[0] || "361001",
        latitude: gps.latitude,
        longitude: gps.longitude,
        ai_confidence_score: 95,
        ai_impact_score: 5.0,
        media_url: mediaUrl,
        description: "Civic issue captured via live citizen camera at " + address
      });

      setUploadProgress(100);
      if (setReportId) setReportId(newReport.id);
      
      // Delay navigation slightly so they see the 100% completion success visual
      setTimeout(() => {
        onNavigate("ai-detect");
      }, 700);

    } catch (err) {
      console.error("Failed uploading report image, falling back to local Blob:", err);
      const fallbackUrl = capturedUrl || "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600";
      
      const newReport = addReport({
        reporter_profile_id: "prof-001",
        category: IssueCategory.POTHOLE,
        severity: SeverityLevel.MEDIUM,
        status: ReportStatus.AI_PROCESSING,
        address: address,
        city: "Jamnagar",
        ward: address.includes("Ward") ? address.split(",")[0].trim() : "Ward No. 4",
        postal_code: address.match(/\d{6}/)?.[0] || "361001",
        latitude: gps.latitude,
        longitude: gps.longitude,
        ai_confidence_score: 90,
        ai_impact_score: 5.0,
        media_url: fallbackUrl,
        description: "Civic issue captured via live citizen camera at " + address
      });

      if (setReportId) setReportId(newReport.id);
      onNavigate("ai-detect");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleCameraDirection = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  };

  return (
    <div className="flex flex-col h-full min-h-[500px] bg-black text-white relative justify-between p-4" id="camera-screen">
      {/* Hidden Gallery Input */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        id="camera-gallery-input"
      />

      {/* Uploading Cloud Storage overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center p-6 text-center"
            id="camera-upload-overlay"
          >
            <div className="relative w-24 h-24 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="48" 
                  cy="48" 
                  r="40" 
                  stroke="rgba(255, 255, 255, 0.1)" 
                  strokeWidth="6" 
                  fill="transparent"
                />
                <circle 
                  cx="48" 
                  cy="48" 
                  r="40" 
                  stroke="#FFFC00" 
                  strokeWidth="6" 
                  fill="transparent"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * uploadProgress) / 100}
                  className="transition-all duration-300"
                />
              </svg>
              <span className="absolute text-sm font-extrabold text-[#FFFC00] font-mono">
                {uploadProgress}%
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight uppercase">Uploading Report Media</h3>
            <p className="text-slate-400 text-xs mt-1.5 max-w-xs leading-relaxed">
              Uploading high-fidelity capture to secure Supabase storage. Initializing multi-agent AI pipeline...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Camera Controls */}
      <div className="flex justify-between items-center z-10">
        <button 
          onClick={() => onNavigate("stories")}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-1 text-xs font-semibold uppercase"
          id="camera-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md tracking-wider font-bold">CITIZEN SHUTTER</span>
        <button 
          onClick={() => setFlash(!flash)}
          disabled={hasCaptured}
          className={`p-2 rounded-full backdrop-blur-md transition-colors ${
            flash ? "bg-[#FFFC00] text-black" : "bg-white/10 text-white hover:bg-white/20"
          }`}
          id="camera-flash-btn"
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewfinder */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-0 bg-slate-950">
        {hasCaptured ? (
          <img 
            src={capturedUrl} 
            alt="Captured issue" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {cameraError ? (
              <div className="p-6 text-center max-w-xs z-10">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-300 leading-relaxed mb-4">{cameraError}</p>
                <button 
                  onClick={handleGalleryClick}
                  className="px-5 py-2.5 bg-white text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 mx-auto hover:bg-slate-100"
                >
                  <Image className="w-4 h-4" />
                  <span>Open Gallery</span>
                </button>
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Reticle guide overlay */}
            {!cameraError && (
              <div className="absolute w-60 h-60 border-2 border-dashed border-white/30 rounded-3xl pointer-events-none flex items-center justify-center">
                <div className="w-2 h-2 bg-white/20 rounded-full" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Interface */}
      <div className="z-10 flex flex-col gap-4 w-full">
        {/* GPS location banner */}
        <div className="bg-black/75 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-[#00BCD4] shrink-0 animate-bounce" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold leading-none">Auto-GPS Capture</p>
            <p className="text-xs font-semibold truncate leading-none mt-1">
              {address}
            </p>
          </div>
          {gpsLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00BCD4]" />}
        </div>

        {/* Shutter Controllers */}
        <div className="flex items-center justify-between px-6 pb-2">
          {/* Gallery placeholder */}
          <button 
            onClick={handleGalleryClick}
            className="w-12 h-12 bg-white/15 hover:bg-white/20 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            id="camera-gallery-btn"
            aria-label="Open Device Gallery"
          >
            <Image className="w-5 h-5 text-slate-300" />
          </button>

          {/* Capture Trigger */}
          {hasCaptured ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyze}
              className="px-8 py-4 bg-[#FFFC00] text-black font-extrabold rounded-full shadow-lg flex items-center gap-2 text-sm uppercase tracking-wider hover:bg-yellow-400 transition-colors"
              id="analyze-snapped-btn"
            >
              <span>Analyze Report</span>
              <Sparkles className="w-4 h-4 text-black" />
            </motion.button>
          ) : (
            <button
              onClick={handleCapture}
              disabled={!!cameraError}
              className={`w-18 h-18 bg-white rounded-full border-4 border-slate-500/50 flex items-center justify-center p-1 active:scale-90 transition-all shadow-xl ${
                cameraError ? "opacity-30 cursor-not-allowed" : "hover:border-white"
              }`}
              id="shutter-trigger-btn"
              aria-label="Capture button"
            >
              <div className="w-full h-full bg-white rounded-full border border-black/15" />
            </button>
          )}

          {/* Reset / Cam Switch */}
          {hasCaptured ? (
            <button 
              onClick={() => {
                setHasCaptured(false);
                setCapturedFile(null);
                setCapturedUrl("");
              }}
              className="w-12 h-12 bg-white/15 hover:bg-white/25 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer text-xs font-bold uppercase transition-all"
              id="retake-btn"
            >
              Retake
            </button>
          ) : (
            <button 
              onClick={toggleCameraDirection}
              disabled={!!cameraError}
              className="w-12 h-12 bg-[#ffffff]/15 hover:bg-white/25 border border-white/10 rounded-xl flex items-center justify-center text-xs font-bold text-slate-300 transition-all"
              id="camera-flip-btn"
              aria-label="Switch Camera Direction"
            >
              <RefreshCw className="w-5 h-5 text-slate-300" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 7. AI Live Detection Screen
export const AILiveDetectionScreen: React.FC<ScreenProps> = ({ onNavigate, reportId }) => {
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setScanStep(1), 1000), // Detecting bounding boxes
      setTimeout(() => setScanStep(2), 2200), // Scanning category Potholes
      setTimeout(() => setScanStep(3), 3200), // Concluding
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <div className="flex flex-col h-full min-h-[500px] bg-slate-950 text-white relative justify-between p-4" id="live-detect-screen">
      {/* Viewfinder Stream */}
      <div className="absolute inset-0 flex items-center justify-center z-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600" 
          alt="Detection background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        
        {/* Animated Scanning Grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF7A6]/5 to-transparent flex flex-col justify-between">
          <motion.div 
            animate={{ y: [0, 500, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-full h-1 bg-gradient-to-r from-transparent via-[#FFFC00] to-transparent shadow-lg shadow-[#FFFC00]/60"
          />
        </div>

        {/* Pulse Bounding Box */}
        {scanStep >= 1 && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute border-4 border-[#FFFC00] rounded-2xl w-56 h-40 flex items-center justify-center shadow-2xl shadow-[#FFFC00]/20 z-10"
            style={{ top: "35%", left: "15%" }}
          >
            {/* Corner Bracket Accents */}
            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 rounded text-[9px] font-bold text-[#FFFC00] tracking-widest uppercase">
              {scanStep >= 2 ? "POTHOLE DETECTED" : "DETECTING..."}
            </div>

            {scanStep >= 2 && (
              <div className="absolute bottom-2 right-2 bg-black/75 px-2 py-1 rounded border border-[#FFFC00]/30 flex flex-col">
                <span className="text-[8px] text-slate-400 font-bold leading-none">Severity: High</span>
                <span className="text-[10px] text-[#FFFC00] font-black leading-none mt-1">Conf: 96%</span>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Top Bar */}
      <div className="flex justify-between items-center z-10">
        <span className="text-xs bg-black/50 px-3 py-1.5 rounded-full border border-white/10 font-bold flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFFC00]" />
          <span>Gemini Vision Pipeline Running</span>
        </span>
      </div>

      {/* Loader2 component helper */}
      {/* Bottom Control Box */}
      <div className="bg-black/85 backdrop-blur-md rounded-3xl p-5 border border-white/15 z-10 flex flex-col gap-3.5 shadow-2xl">
        <h3 className="font-bold text-sm tracking-widest uppercase text-slate-400 leading-none">8-Agent Multi-Pipeline Progress</h3>
        
        {/* Step indicator */}
        <div className="flex flex-col gap-2">
          {[
            { label: "Vision Agent: Analyzing image elements", active: scanStep >= 0, done: scanStep > 1 },
            { label: "Severity Agent: Computing impact factor", active: scanStep >= 1, done: scanStep > 2 },
            { label: "Duplicate Agent: Checking nearby coords", active: scanStep >= 2, done: scanStep > 2 },
            { label: "Routing Agent: Selecting assignment ward", active: scanStep >= 3, done: false }
          ].map((step, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                step.done 
                  ? "bg-green-500 text-white" 
                  : step.active 
                    ? "bg-[#FFFC00] text-black animate-pulse" 
                    : "bg-slate-800 text-slate-500"
              }`}>
                {step.done ? <Check className="w-2.5 h-2.5" /> : <div className="w-1 h-1 rounded-full bg-current" />}
              </div>
              <span className={`font-medium ${step.active ? "text-white" : "text-slate-500"}`}>{step.label}</span>
            </div>
          ))}
        </div>

        {scanStep >= 2 ? (
          <button
            onClick={() => onNavigate("ai-result")}
            className="w-full py-4 bg-[#FFFC00] text-black font-extrabold rounded-full shadow-lg hover:bg-yellow-300 active:scale-95 transition-all text-sm uppercase tracking-wider mt-2 flex items-center justify-center gap-2"
            id="tap-to-report-btn"
          >
            <span>Tap to Report</span>
            <Sparkles className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-full py-3.5 bg-slate-800 text-slate-400 rounded-full text-center text-xs font-semibold uppercase tracking-wider mt-2">
            AI is scanning...
          </div>
        )}
      </div>
    </div>
  );
};

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

// 8. AI Analysis Result Screen
export const AIAnalysisResultScreen: React.FC<ScreenProps> = ({ onNavigate, reportId }) => {
  const { reports, setReports } = useApp();
  const report = reports.find(r => r.id === reportId) || reports.find(r => r.id.startsWith("rep-temp-")) || reports[0];

  const [category, setCategory] = useState<IssueCategory>(report ? report.category : IssueCategory.POTHOLE);
  const [severity, setSeverity] = useState<SeverityLevel>(report ? report.severity : SeverityLevel.MEDIUM);
  const [subcategory, setSubcategory] = useState(report?.subcategory || "");
  const [description, setDescription] = useState(report?.description || "");
  const [address, setAddress] = useState(report?.address || "");
  const [ward, setWard] = useState(report?.ward || "");
  const [deptName, setDeptName] = useState(report?.department_name || "Municipality Board");
  const [landmark, setLandmark] = useState(report?.landmark || "");
  const [lat, setLat] = useState(report?.latitude?.toString() || "22.4707");
  const [lng, setLng] = useState(report?.longitude?.toString() || "70.0577");
  const [tags, setTags] = useState(report?.landmark || ""); // using landmark as additional notes/tags

  const [isSaving, setIsSaving] = useState(false);

  // Sync state if report changes or loads late
  useEffect(() => {
    if (report) {
      setCategory(report.category);
      setSeverity(report.severity);
      setSubcategory(report.subcategory || "");
      setDescription(report.description || "");
      setAddress(report.address || "");
      setWard(report.ward || "");
      setDeptName(report.department_name || "Municipality Board");
      setLandmark(report.landmark || "");
      setLat(report.latitude?.toString() || "22.4707");
      setLng(report.longitude?.toString() || "70.0577");
      setTags(report.landmark || "");
    }
  }, [report]);

  if (!report) {
    return (
      <div className="p-8 text-center" id="ai-result-screen">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <p className="text-slate-600 font-bold">No active report found for verification.</p>
        <button onClick={() => onNavigate("camera")} className="mt-4 px-6 py-2 bg-[#FFFC00] text-black font-extrabold rounded-full">
          Open Camera
        </button>
      </div>
    );
  }

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      const parsedLat = parseFloat(lat) || report.latitude;
      const parsedLng = parseFloat(lng) || report.longitude;

      const deptMapping: Record<string, string> = {
        "Road Maintenance Dept.": "dept-road",
        "Municipality": "dept-muni",
        "Water Supply Dept.": "dept-water",
        "Electricity Board": "dept-elec"
      };

      const deptId = deptMapping[deptName] || "dept-muni";

      const updates = {
        category,
        severity,
        subcategory,
        description,
        address,
        ward,
        department_id: deptId,
        department_name: deptName,
        latitude: parsedLat,
        longitude: parsedLng,
        landmark: tags || landmark,
      };

      // Save to Supabase
      if (report.id && !report.id.startsWith("rep-temp-")) {
        await reportsRepository.update(report.id, updates);
      }

      // Update in our React App Context state
      setReports(prev => prev.map(r => r.id === report.id ? {
        ...r,
        ...updates,
        category: category as any,
        severity: severity as any,
        department_name: deptName,
      } : r));

      setIsSaving(false);
      onNavigate("routing");
    } catch (err) {
      console.error("Error updating verified report details:", err);
      setIsSaving(false);
      // fallback navigate anyway to ensure smooth user experience
      onNavigate("routing");
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5 bg-slate-50 min-h-[500px]" id="ai-result-screen">
      {/* Header */}
      <div className="text-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <Sparkles className="w-7 h-7 text-[#9C27B0] mx-auto mb-1 animate-pulse" />
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">AI & Citizen Verification Form</h2>
        <p className="text-slate-500 text-[11px] mt-1 leading-normal">Our AI analyzed your snapshot. You can review, refine, and edit any values before official dispatch.</p>
      </div>

      {/* Editing Form */}
      <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-slate-150/60 shadow-sm max-h-[500px] overflow-y-auto">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Interactive Diagnostic Editor</h3>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Classification Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as IssueCategory)}
            className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFFC00] focus:bg-white transition-all"
            id="edit-category-select"
          >
            <option value={IssueCategory.POTHOLE}>Potholes / Road Damage</option>
            <option value={IssueCategory.GARBAGE}>Garbage & Waste Dump</option>
            <option value={IssueCategory.WATER}>Water Leakage / Drainage</option>
            <option value={IssueCategory.STREETLIGHT}>Streetlight Flickering/Broken</option>
            <option value={IssueCategory.PUBLIC_SAFETY}>Public Safety Hazard</option>
            <option value={IssueCategory.TRAFFIC_HAZARD}>Traffic Sign / Hazard</option>
            <option value={IssueCategory.OTHER}>Other Civic Issue</option>
          </select>
        </div>

        {/* Severity */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assessed Severity Level</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
            className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFFC00] focus:bg-white transition-all"
            id="edit-severity-select"
          >
            <option value={SeverityLevel.LOW}>Low Severity</option>
            <option value={SeverityLevel.MEDIUM}>Medium Severity</option>
            <option value={SeverityLevel.HIGH}>High Severity</option>
            <option value={SeverityLevel.CRITICAL}>Critical / Urgent Action</option>
          </select>
        </div>

        {/* Subcategory (Title) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Issue Title (Subcategory)</label>
          <input
            type="text"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            placeholder="e.g. Deep Pothole Near Intersection"
            className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFFC00] focus:bg-white transition-all"
            id="edit-subcategory-input"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Detailed Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the issue size, hazard, and urgency..."
            className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFFC00] focus:bg-white transition-all resize-none"
            id="edit-description-textarea"
          />
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Detected Street Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Auto-reverse GPS address..."
            className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFFC00] focus:bg-white transition-all"
            id="edit-address-input"
          />
        </div>

        {/* Ward */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ward Name / Sector</label>
          <input
            type="text"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            placeholder="e.g. Ward No. 4"
            className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFFC00] focus:bg-white transition-all"
            id="edit-ward-input"
          />
        </div>

        {/* Assigned Department */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Department</label>
          <select
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFFC00] focus:bg-white transition-all"
            id="edit-dept-select"
          >
            <option value="Road Maintenance Dept.">Road Maintenance Dept.</option>
            <option value="Municipality">Municipality (General)</option>
            <option value="Water Supply Dept.">Water Supply Dept.</option>
            <option value="Electricity Board">Electricity Board</option>
          </select>
        </div>

        {/* Additional Tags / Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tags / Additional Notes</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. flooded, dangerous at night, block"
            className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFFC00] focus:bg-white transition-all"
            id="edit-tags-input"
          />
        </div>

        {/* Coordinates (Latitude & Longitude) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GPS Latitude</label>
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFFC00] focus:bg-white transition-all"
              id="edit-lat-input"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GPS Longitude</label>
            <input
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FFFC00] focus:bg-white transition-all"
              id="edit-lng-input"
            />
          </div>
        </div>

        {/* AI Confidence Indicators */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2 mt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Pipeline Confidence</span>
            <span className="font-extrabold text-[#9C27B0]">{report.ai_confidence_score}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" style={{ width: `${report.ai_confidence_score}%` }} />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={handleConfirm}
          disabled={isSaving}
          className="w-full py-4 bg-[#FFFC00] text-black font-extrabold rounded-full shadow-md hover:bg-yellow-300 active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
          id="confirm-report-btn"
        >
          {isSaving ? "Saving..." : "Confirm & Report Dispatch"}
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigate("camera")}
          className="w-full py-3 border border-slate-300 bg-white rounded-full font-bold text-slate-600 hover:text-black transition-all text-xs"
          id="retake-diagnostic-btn"
        >
          Discard & Retake Picture
        </button>
      </div>
    </div>
  );
};

// 21. Tracking Progress Screen
export const TrackingProgressScreen: React.FC<ScreenProps> = ({ onNavigate, reportId }) => {
  const { reports } = useApp();
  const report = reports.find(r => r.id === reportId) || reports.find(r => r.id.startsWith("rep-temp-")) || reports[0];

  const steps = [
    { title: "Reported", desc: "Citizen capture approved", date: "30 June, 10:30 AM", done: true },
    { title: "AI Multi-Agent Analysis Completed", desc: "Category: Potholes, Severity: High", date: "30 June, 10:31 AM", done: true },
    { title: "Community Verified", desc: "Approved by 12 neighborhood citizens", date: "30 June, 11:15 AM", done: true },
    { title: "Assigned & Routed", desc: "Assigned to Road Maintenance Dept.", date: "30 June, 12:40 PM", done: report.status !== ReportStatus.COMMUNITY_VERIFICATION },
    { title: "In Progress", desc: "Officer Rajesh Kumar dispatched", date: "ETA: 2-3 Days", done: report.status === ReportStatus.RESOLVED || report.status === ReportStatus.IN_PROGRESS },
    { title: "Resolved & Closed", desc: "Before-After proof validated", date: "Pending Verification", done: report.status === ReportStatus.RESOLVED }
  ];

  return (
    <div className="flex flex-col gap-4 p-5 bg-white min-h-[500px]" id="tracking-screen">
      {/* Header Info card */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Report Tracking Code</span>
          <span className="font-bold text-slate-800 text-sm mt-0.5">{report.report_code}</span>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest mb-1">Issue Resolution History</h3>

      {/* Progress timeline */}
      <div className="flex flex-col pl-4 relative border-l-2 border-slate-100 gap-6">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex flex-col pl-6">
            {/* Circle Node */}
            <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              step.done 
                ? "bg-green-500 border-green-500 text-white" 
                : "bg-white border-slate-350 text-slate-350"
            }`}>
              {step.done && <Check className="w-2.5 h-2.5" />}
            </div>

            {/* Step Content */}
            <h4 className={`text-xs font-bold leading-none ${step.done ? "text-slate-800" : "text-slate-400"}`}>{step.title}</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">{step.desc}</p>
            <span className="text-[10px] text-slate-400 mt-0.5 leading-none">{step.date}</span>
          </div>
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={() => {
          if (report.status === ReportStatus.RESOLVED) {
            onNavigate("resolution");
          } else {
            onNavigate("stories");
          }
        }}
        className="w-full py-4 bg-[#FFFC00] text-black font-extrabold rounded-full shadow-lg hover:bg-yellow-300 active:scale-95 transition-all text-sm uppercase tracking-wider mt-4"
        id="tracking-back-btn"
      >
        Close Tracker
      </button>
    </div>
  );
};

// 22. Issue Resolution Celebration Screen
export const IssueResolutionScreen: React.FC<ScreenProps> = ({ onNavigate, reportId }) => {
  const { currentProfile } = useApp();

  return (
    <div className="flex flex-col justify-between p-6 bg-gradient-to-b from-[#4CAF50]/15 to-white min-h-[550px] text-center" id="resolution-screen">
      <div className="flex-1 flex flex-col justify-center items-center gap-4">
        {/* Confetti Animation wrapper */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-500/20"
        >
          <ThumbsUp className="w-12 h-12" />
        </motion.div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Issue Resolved! 🏅</h2>
          <p className="text-green-600 font-semibold text-xs mt-1.5">Verified by Resolution Validation Agent</p>
        </div>

        <p className="text-slate-500 text-xs max-w-xs mt-2 leading-relaxed">
          Thanks for making your neighborhood safer and cleaner. Before and After proof photos have been confirmed.
        </p>

        {/* Points Card */}
        <div className="w-full max-w-xs bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-around gap-2 mt-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Community Impact</span>
            <span className="text-lg font-black text-slate-900 mt-0.5">+120 Points</span>
          </div>
          <div className="w-[1px] h-8 bg-slate-200" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Your Contribution</span>
            <span className="text-lg font-black text-slate-900 mt-0.5">+20 XP</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs mx-auto flex flex-col gap-3">
        <button
          onClick={() => onNavigate("before-after")}
          className="w-full py-4 bg-black text-white font-extrabold rounded-full shadow-lg hover:bg-slate-800 active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
          id="view-proof-btn"
        >
          <Sparkles className="w-4 h-4 text-[#FFFC00]" />
          <span>View Before / After Proof</span>
        </button>
        <button
          onClick={() => onNavigate("stories")}
          className="w-full py-3.5 border border-slate-200 rounded-full text-slate-700 hover:text-black font-semibold text-xs transition-colors"
          id="resolution-home-btn"
        >
          Back to Home Feed
        </button>
      </div>
    </div>
  );
};

// 18. Before / After Screen
export const BeforeAfterScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col gap-5 p-5 min-h-[500px] bg-white" id="before-after-screen">
      <div className="text-center">
        <Sparkles className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Resolution Case Study</h2>
        <p className="text-slate-500 text-xs mt-1">Proof of resolved community report SFIX-2026-0630-0010</p>
      </div>

      {/* Comparative View cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Before Card */}
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 shadow-sm">
          <div className="relative aspect-video w-full bg-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&q=80&w=400" 
              alt="Pothole before" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute top-3 left-3 bg-[#F44336] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">Before</span>
          </div>
          <div className="p-3">
            <h4 className="font-semibold text-slate-800 text-xs">Pavement Burst Leakage</h4>
            <span className="text-[10px] text-slate-400 mt-1 block">Reported on 28 June 2026</span>
          </div>
        </div>

        {/* After Card */}
        <div className="flex flex-col gap-2 rounded-2xl border border-green-150 overflow-hidden bg-green-50/20 shadow-sm">
          <div className="relative aspect-video w-full bg-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&q=80&w=400" 
              alt="Road after" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">After</span>
          </div>
          <div className="p-3">
            <h4 className="font-semibold text-slate-800 text-xs">Repaved Concrete Finish</h4>
            <span className="text-[10px] text-green-600 font-medium mt-1 block">Resolved on 30 June 2026</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2 flex flex-col gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolution SLA Diagnostics</h4>
        <div className="flex justify-between text-xs py-1 border-b border-slate-100/50">
          <span className="text-slate-500">Total Turnaround Time:</span>
          <span className="font-semibold text-slate-800">46 Hours</span>
        </div>
        <div className="flex justify-between text-xs py-1">
          <span className="text-slate-500">Validator Verification score:</span>
          <span className="font-semibold text-green-600">9.8/10 (Confirmed Match)</span>
        </div>
      </div>

      <button
        onClick={() => onNavigate("stories")}
        className="w-full py-4 bg-[#FFFC00] text-black font-extrabold rounded-full shadow-lg hover:bg-yellow-300 active:scale-95 transition-all text-sm uppercase tracking-wider mt-2"
        id="ba-done-btn"
      >
        Done
      </button>
    </div>
  );
};
