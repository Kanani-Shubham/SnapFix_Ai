import React from "react";
import { motion } from "motion/react";
import { Search, WifiOff, CloudLightning, ArrowRight, RefreshCw } from "lucide-react";

interface UtilityProps {
  onAction?: () => void;
  onResetFilters?: () => void;
}

export const EmptyState: React.FC<UtilityProps> = ({ onResetFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]" id="empty-state-screen">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-20 h-20 bg-[#FFF7A6]/50 rounded-full flex items-center justify-center mb-6"
      >
        <Search className="w-10 h-10 text-[#FF9800]" />
      </motion.div>
      <h3 className="text-xl font-bold text-slate-800 tracking-tight">No Issues Found</h3>
      <p className="text-slate-500 text-sm max-w-xs mt-2 leading-relaxed">
        Try adjusting your search query, clearing active category filters, or search in a different geographic area.
      </p>
      {onResetFilters && (
        <button
          onClick={onResetFilters}
          className="mt-6 px-6 py-3 bg-[#FFFC00] text-black font-semibold rounded-full shadow-md hover:bg-yellow-300 active:scale-95 transition-all text-sm"
          id="reset-filters-btn"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};

export const NoInternetState: React.FC<UtilityProps> = ({ onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[500px]" id="no-internet-screen">
      <motion.div 
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          ease: "easeInOut"
        }}
        className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100"
      >
        <WifiOff className="w-10 h-10 text-[#F44336]" />
      </motion.div>
      <h3 className="text-xl font-bold text-slate-800 tracking-tight">No Internet Connection</h3>
      <p className="text-slate-500 text-sm max-w-xs mt-2 leading-relaxed">
        Please check your cellular network or Wi-Fi settings. We will automatically queue any new reports.
      </p>
      <button
        onClick={onAction || (() => window.location.reload())}
        className="mt-6 px-6 py-3 bg-[#FFFC00] text-black font-semibold rounded-full shadow-md hover:bg-yellow-300 active:scale-95 transition-all text-sm flex items-center gap-2"
        id="internet-retry-btn"
      >
        <RefreshCw className="w-4 h-4 animate-spin-slow" />
        <span>Try Again</span>
      </button>
    </div>
  );
};

export const OfflineSuccessState: React.FC<{ onViewReports: () => void }> = ({ onViewReports }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[500px]" id="offline-success-screen">
      <motion.div 
        initial={{ scale: 0.5, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        className="w-20 h-20 bg-[#FFF7A6] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#FFFC00]/10"
      >
        <CloudLightning className="w-10 h-10 text-black" />
      </motion.div>
      <h3 className="text-xl font-bold text-slate-800 tracking-tight">Report Saved Offline</h3>
      <p className="text-slate-500 text-sm max-w-xs mt-2 leading-relaxed">
        We've queued your captured media and auto-captured GPS coordinates securely. They will sync as soon as you are back online!
      </p>
      
      <div className="flex flex-col gap-3 w-full max-w-xs mt-8">
        <button
          onClick={onViewReports}
          className="px-6 py-3 bg-[#FFFC00] text-black font-semibold rounded-full shadow-md hover:bg-yellow-300 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
          id="offline-view-btn"
        >
          <span>View My Reports</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
