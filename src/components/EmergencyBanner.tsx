import React, { useState } from 'react';
import { PhoneCall, AlertCircle, Clock, MapPin, X } from 'lucide-react';

interface EmergencyBannerProps {
  onOpenBooking: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ onOpenBooking }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-rose-950 text-rose-50 border-b border-rose-900/60 py-2.5 px-4 text-xs transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 text-center md:text-left">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-600 text-white shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
          </span>
          <span className="font-semibold text-rose-200 uppercase tracking-wide">
            24/7 Level 1 Trauma Emergency
          </span>
          <span className="hidden lg:inline text-rose-300/80">·</span>
          <span className="text-rose-100 hidden sm:inline">
            Immediate resuscitation bays & rapid response cath lab available around the clock.
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0 font-medium">
          <a
            href="tel:911"
            className="flex items-center gap-1.5 text-white bg-rose-600 hover:bg-rose-500 transition-colors px-2.5 py-1 rounded-md font-semibold"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Emergency: (800) 932-CARE</span>
          </a>
          <span className="text-rose-400/60 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-rose-200">
            <Clock className="w-3 h-3 text-rose-400" />
            <span>Walk-in triage 24 Hours</span>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-rose-300 hover:text-white transition-colors p-1"
            title="Dismiss notice"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
