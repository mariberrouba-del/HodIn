import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  textSize?: "sm" | "md" | "lg" | "xl";
}

export default function Logo({ className = "w-16 h-16", showText = true, textSize = "md" }: LogoProps) {
  const getTextSizeClass = () => {
    switch (textSize) {
      case "sm": return "text-sm";
      case "md": return "text-lg";
      case "lg": return "text-2xl";
      case "xl": return "text-4xl";
      default: return "text-lg";
    }
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <svg
        className={`${className} shrink-0 drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)]`}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Tech Orbits - Green/Cyan */}
        {/* Upper Green Arc */}
        <path
          d="M 33 80 A 70 70 0 1 1 167 80"
          stroke="#10b981"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Lower Cyan Arc */}
        <path
          d="M 167 80 A 70 70 0 0 1 33 80"
          stroke="#06b6d4"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Tech Circuit Junction Lines (Nodes) on the outer orbit */}
        <circle cx="55" cy="27" r="4.5" fill="#f8fafc" stroke="#10b981" strokeWidth="2.5" />
        <circle cx="100" cy="15" r="4.5" fill="#f8fafc" stroke="#10b981" strokeWidth="2.5" />
        <circle cx="145" cy="27" r="4.5" fill="#f8fafc" stroke="#10b981" strokeWidth="2.5" />
        <circle cx="28" cy="85" r="4.5" fill="#f8fafc" stroke="#06b6d4" strokeWidth="2.5" />
        <circle cx="172" cy="85" r="4.5" fill="#f8fafc" stroke="#06b6d4" strokeWidth="2.5" />

        {/* Inner Tech Circuit Semicircle Connector */}
        <path
          d="M 45 80 A 58 58 0 1 1 155 80"
          stroke="#0891b2"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
          opacity="0.7"
        />

        {/* Grey/Silver Mechanical Gear (Cog Wheel) */}
        <g transform="translate(100, 90)">
          {/* Gear Teeth (12 teeth around the rim) */}
          <g fill="#94a3b8" stroke="#cbd5e1" strokeWidth="0.75">
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x1 = Math.cos(angle) * 36;
              const y1 = Math.sin(angle) * 36;
              const x2 = Math.cos(angle - 0.1) * 44;
              const y2 = Math.sin(angle - 0.1) * 44;
              const x3 = Math.cos(angle + 0.1) * 44;
              const y3 = Math.sin(angle + 0.1) * 44;
              return (
                <polygon
                  key={i}
                  points={`
                    ${Math.cos(angle - 0.12) * 36},${Math.sin(angle - 0.12) * 36}
                    ${Math.cos(angle - 0.08) * 45},${Math.sin(angle - 0.08) * 45}
                    ${Math.cos(angle + 0.08) * 45},${Math.sin(angle + 0.08) * 45}
                    ${Math.cos(angle + 0.12) * 36},${Math.sin(angle + 0.12) * 36}
                  `}
                />
              );
            })}
            {/* Gear Body Rim */}
            <circle cx="0" cy="0" r="37" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
            {/* Gear Inner Cutout */}
            <circle cx="0" cy="0" r="26" fill="#030712" />
          </g>

          {/* Golden Sand Dunes Layers (3 waves) inside the bottom portion of the gear */}
          <g>
            {/* Dune 1 (Back) */}
            <path
              d="M -30 18 Q -10 6, 12 15 T 32 12 L 32 35 L -32 35 Z"
              fill="#92400e"
              stroke="#b45309"
              strokeWidth="0.5"
            />
            {/* Dune 2 (Middle) */}
            <path
              d="M -32 23 Q -15 12, 11 20 T 32 17 L 32 37 L -32 37 Z"
              fill="#b45309"
              stroke="#d97706"
              strokeWidth="0.5"
            />
            {/* Dune 3 (Front - Sand waves of El Oued) */}
            <path
              d="M -34 28 Q -8 18, 14 26 T 33 22 L 33 39 L -34 39 Z"
              fill="#ca8a04"
              stroke="#eab308"
              strokeWidth="1"
            />
          </g>

          {/* Green Sprout Growing Out of Golden Dunes */}
          <g transform="translate(0, 10)">
            {/* Sprout Trunk */}
            <path
              d="M 0 15 Q -1.5 5, 0 -13 Q 1.5 5, 0 15 Z"
              fill="#10b981"
            />
            {/* Left Leaf */}
            <path
              d="M 0 -8 Q -16 -24, -18 -6 Q -8 0, 0 -8 Z"
              fill="#059669"
              stroke="#10b981"
              strokeWidth="0.75"
            />
            {/* Right Leaf */}
            <path
              d="M 0 -8 Q 16 -24, 18 -6 Q 8 0, 0 -8 Z"
              fill="#10b981"
              stroke="#34d399"
              strokeWidth="0.75"
            />
          </g>
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col items-start leading-none pointer-events-none select-none" style={{ direction: "ltr" }}>
          <div className="font-extrabold tracking-tight text-lg whitespace-nowrap" style={{ direction: "ltr" }}>
            <span className="text-emerald-500 font-sans">Hod</span>
            <span className="relative text-emerald-400 font-sans inline-block">
              I
              <span className="absolute -top-[1.5px] left-[2.5px] w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]"></span>
            </span>
            <span className="text-cyan-400 font-sans">nt</span>
          </div>
          <span className="text-[9px] text-slate-400 font-medium tracking-wider mt-0.5" style={{ direction: "rtl" }}>
            للحلول والتعليم الزراعي
          </span>
        </div>
      )}
    </div>
  );
}
