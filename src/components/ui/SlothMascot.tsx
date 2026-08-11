import React from "react";

export type SlothPose = "happy" | "cheering" | "calm" | "studying";

interface SlothMascotProps {
  pose?: SlothPose;
  size?: number;
  className?: string;
}

export function SlothMascot({ pose = "happy", size = 180, className = "" }: SlothMascotProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105"
      >
        {/* Shadow base */}
        <ellipse cx="100" cy="180" rx="65" ry="12" fill="#EAD9C9" />

        {/* Sloth Body */}
        <path
          d="M60 110 C50 140, 55 175, 100 175 C145 175, 150 140, 140 110 C135 90, 65 90, 60 110 Z"
          fill="#A67C52"
        />

        {/* Belly patch */}
        <ellipse cx="100" cy="142" rx="32" ry="24" fill="#FCEBD9" />

        {/* Head */}
        <circle cx="100" cy="85" r="48" fill="#A67C52" />

        {/* Face Mask (Cream light patch) */}
        <path
          d="M62 85 C62 65, 80 58, 100 58 C120 58, 138 65, 138 85 C138 105, 120 112, 100 112 C80 112, 62 105, 62 85 Z"
          fill="#FCEBD9"
        />

        {/* Eye Patches (Dark warm brown markings) */}
        <ellipse cx="80" cy="84" rx="14" ry="10" transform="rotate(-15 80 84)" fill="#6E4727" />
        <ellipse cx="120" cy="84" rx="14" ry="10" transform="rotate(15 120 84)" fill="#6E4727" />

        {/* Eyes */}
        {pose === "studying" ? (
          <>
            {/* Glasses */}
            <circle cx="80" cy="83" r="11" stroke="#2B1E19" strokeWidth="3" fill="none" />
            <circle cx="120" cy="83" r="11" stroke="#2B1E19" strokeWidth="3" fill="none" />
            <line x1="91" y1="83" x2="109" y2="83" stroke="#2B1E19" strokeWidth="3" />
            <circle cx="80" cy="83" r="4" fill="#2B1E19" />
            <circle cx="120" cy="83" r="4" fill="#2B1E19" />
          </>
        ) : pose === "cheering" ? (
          <>
            {/* Happy squint eyes */}
            <path d="M74 84 Q80 77 86 84" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M114 84 Q120 77 126 84" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Big friendly round eyes with highlights */}
            <circle cx="80" cy="83" r="5" fill="#FFFFFF" />
            <circle cx="120" cy="83" r="5" fill="#FFFFFF" />
            <circle cx="81" cy="82" r="2.5" fill="#2B1E19" />
            <circle cx="121" cy="82" r="2.5" fill="#2B1E19" />
          </>
        )}

        {/* Cute Nose */}
        <ellipse cx="100" cy="93" rx="6" ry="4" fill="#422513" />

        {/* Smiling Mouth */}
        {pose === "cheering" ? (
          <path d="M92 98 Q100 108 108 98 Z" fill="#D9534F" stroke="#422513" strokeWidth="1.5" />
        ) : (
          <path d="M94 97 Q100 102 106 97" stroke="#422513" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {/* Cheeks (Blush) */}
        <circle cx="68" cy="94" r="5" fill="#FFB703" opacity="0.6" />
        <circle cx="132" cy="94" r="5" fill="#FFB703" opacity="0.6" />

        {/* Arms Pose */}
        {pose === "cheering" ? (
          <>
            {/* Arms up celebrating */}
            <path d="M60 105 Q40 70 45 55" stroke="#A67C52" strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M140 105 Q160 70 155 55" stroke="#A67C52" strokeWidth="14" strokeLinecap="round" fill="none" />
            {/* Little Sparkles */}
            <path d="M40 40 L44 48 L52 52 L44 56 L40 64 L36 56 L28 52 L36 48 Z" fill="#FFB703" />
            <path d="M160 40 L164 48 L172 52 L164 56 L160 64 L156 56 L148 52 L156 48 Z" fill="#FFB703" />
          </>
        ) : pose === "studying" ? (
          <>
            {/* Holding a tiny book */}
            <path d="M60 115 C75 125, 85 130, 95 130" stroke="#A67C52" strokeWidth="12" strokeLinecap="round" />
            <path d="M140 115 C125 125, 115 130, 105 130" stroke="#A67C52" strokeWidth="12" strokeLinecap="round" />
            <rect x="82" y="120" width="36" height="24" rx="3" fill="var(--primary)" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="100" y1="120" x2="100" y2="144" stroke="#FFFFFF" strokeWidth="2" />
          </>
        ) : (
          <>
            {/* Cozy resting arms on belly */}
            <path d="M62 115 Q80 135 92 135" stroke="#A67C52" strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M138 115 Q120 135 108 135" stroke="#A67C52" strokeWidth="12" strokeLinecap="round" fill="none" />
          </>
        )}
      </svg>
    </div>
  );
}
