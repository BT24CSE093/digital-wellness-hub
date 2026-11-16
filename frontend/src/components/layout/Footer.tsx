import React from 'react';
import { Heart, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#30363d] bg-[#161b22] py-8 text-[#8b949e] text-xs sm:text-sm">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">OffGrid Campus</span>
          <span>•</span>
          <span className="text-[#8b949e]">Digital Wellness Hub</span>
          <span>•</span>
          <span className="italic text-[#8b949e]">"Your Digital Life. Your Rules."</span>
        </div>
        <div className="flex items-center gap-4 text-[#8b949e]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Privacy First Architecture
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            Crafted with <Heart className="h-3.5 w-3.5 text-rose-500 inline" /> for Students
          </span>
        </div>
      </div>
    </footer>
  );
};
