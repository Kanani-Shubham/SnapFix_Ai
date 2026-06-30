import React from "react";
import { motion } from "motion/react";
import { Badge } from "../types";
import { Camera, User, CheckCircle, Award, Shield, Calendar, Lock } from "lucide-react";

interface BadgeTileProps {
  badge: Badge;
}

export const BadgeTile: React.FC<BadgeTileProps> = ({ badge }) => {
  const getIcon = (size: number = 24) => {
    switch (badge.icon_name) {
      case "camera":
        return <Camera size={size} />;
      case "user":
        return <User size={size} />;
      case "check-circle":
        return <CheckCircle size={size} />;
      case "badge":
        return <Award size={size} />;
      case "shield":
        return <Shield size={size} />;
      case "calendar":
        return <Calendar size={size} />;
      default:
        return <Award size={size} />;
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative p-4 rounded-2xl flex flex-col items-center justify-center border text-center transition-all ${
        badge.unlocked 
          ? "bg-gradient-to-br from-[#FFF7A6]/30 to-[#FFFC00]/10 border-[#FFFC00]/60 shadow-sm" 
          : "bg-slate-50 border-slate-200/60 opacity-60"
      }`}
      id={`badge-tile-${badge.id}`}
    >
      {/* Badge Ring Layout */}
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 relative ${
        badge.unlocked 
          ? "bg-[#FFFC00] text-black shadow-md shadow-[#FFFC00]/20" 
          : "bg-slate-200 text-slate-400"
      }`}>
        {getIcon()}
        
        {/* Lock Overlay for Unearned Badges */}
        {!badge.unlocked && (
          <div className="absolute -bottom-1 -right-1 bg-slate-400 text-white p-1 rounded-full border border-white">
            <Lock size={10} />
          </div>
        )}
      </div>

      <h4 className="text-sm font-semibold text-slate-800 leading-tight mb-1">{badge.name}</h4>
      <p className="text-xs text-slate-500 leading-snug line-clamp-2">{badge.description}</p>
    </motion.div>
  );
};
