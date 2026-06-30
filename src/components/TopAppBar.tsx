import React from "react";
import { ArrowLeft, Share2, MoreVertical, ShieldAlert } from "lucide-react";

interface TopAppBarProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ title, onBack, rightAction }) => {
  return (
    <div className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-30 flex items-center justify-between h-14" id="top-app-bar">
      <div className="flex items-center gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-1 rounded-full text-slate-600 hover:text-black hover:bg-slate-50 transition-colors"
            aria-label="Go Back"
            id="back-arrow-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-slate-900 font-bold text-lg tracking-tight truncate max-w-[180px] sm:max-w-[300px]">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-1.5" id="top-bar-actions">
        {rightAction || (
          <>
            <button className="p-1.5 rounded-full text-slate-500 hover:text-black hover:bg-slate-50 transition-colors" aria-label="Share">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-full text-slate-500 hover:text-black hover:bg-slate-50 transition-colors" aria-label="Options">
              <MoreVertical className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
