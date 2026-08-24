import React from "react";
import { TopOrnament, BackStyle, BorderStyle, ThemeColors } from "../types";

export const LotusIcon: React.FC<{ color?: string; className?: string; size?: number }> = ({
  color = "#B37A56",
  className = "",
  size = 28,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Central Lotus Petal */}
    <path
      d="M50 8C50 8 41 26 41 46C41 58 45 66 50 69C55 66 59 58 59 46C59 26 50 8 50 8Z"
      stroke={color}
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Left Petal 1 */}
    <path
      d="M48 20C48 20 32 30 28 47C25 60 31 67 43 68C38 61 38 47 48 30"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right Petal 1 */}
    <path
      d="M52 20C52 20 68 30 72 47C75 60 69 67 57 68C62 61 62 47 52 30"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Outer Left Petal */}
    <path
      d="M38 38C38 38 18 45 13 58C9 68 18 73 34 71C25 66 26 53 38 46"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Outer Right Petal */}
    <path
      d="M62 38C62 38 82 45 87 58C91 68 82 73 66 71C75 66 74 53 62 46"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Base Calyx */}
    <path
      d="M30 72C40 76 60 76 70 72"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

export const TreeOfLifeIcon: React.FC<{
  color?: string;
  className?: string;
  size?: number;
  palette?: { pink: string; blue: string; white: string; trunk: string };
}> = ({
  color = "#B37A56",
  className = "",
  size = 140,
  palette = { pink: "#E9B6C2", blue: "#A3C3D9", white: "#FFFFFF", trunk: "#FFFFFF" },
}) => (
  <svg
    width={size}
    height={size * 1.05}
    viewBox="0 0 200 210"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Tree Foliage: Multicolored Delicate Leaves (Oval Petals) */}
    {/* Center Top Leaves */}
    <ellipse cx="100" cy="45" rx="5" ry="10" fill={palette.white} />
    <ellipse cx="88" cy="48" rx="6" ry="11" transform="rotate(-25 88 48)" fill={palette.blue} />
    <ellipse cx="112" cy="48" rx="6" ry="11" transform="rotate(25 112 48)" fill={palette.pink} />

    {/* Upper Layer */}
    <ellipse cx="76" cy="56" rx="6" ry="11" transform="rotate(-40 76 56)" fill={palette.pink} />
    <ellipse cx="124" cy="56" rx="6" ry="11" transform="rotate(40 124 56)" fill={palette.blue} />
    <ellipse cx="98" cy="62" rx="5" ry="9" fill={palette.pink} />
    <ellipse cx="64" cy="68" rx="6" ry="11" transform="rotate(-55 64 68)" fill={palette.blue} />
    <ellipse cx="136" cy="68" rx="6" ry="11" transform="rotate(55 136 68)" fill={palette.white} />

    {/* Middle Canopy Leaves */}
    <ellipse cx="54" cy="85" rx="7" ry="12" transform="rotate(-70 54 85)" fill={palette.pink} />
    <ellipse cx="72" cy="78" rx="6" ry="11" transform="rotate(-35 72 78)" fill={palette.white} />
    <ellipse cx="86" cy="72" rx="5" ry="10" transform="rotate(-15 86 72)" fill={palette.blue} />
    <ellipse cx="114" cy="72" rx="5" ry="10" transform="rotate(15 114 72)" fill={palette.pink} />
    <ellipse cx="128" cy="78" rx="6" ry="11" transform="rotate(35 128 78)" fill={palette.white} />
    <ellipse cx="146" cy="85" rx="7" ry="12" transform="rotate(70 146 85)" fill={palette.blue} />

    {/* Dense Inner Canopy */}
    <ellipse cx="62" cy="100" rx="6" ry="11" transform="rotate(-80 62 100)" fill={palette.blue} />
    <ellipse cx="76" cy="94" rx="6" ry="10" transform="rotate(-45 76 94)" fill={palette.pink} />
    <ellipse cx="90" cy="88" rx="5" ry="9" transform="rotate(-10 90 88)" fill={palette.white} />
    <ellipse cx="110" cy="88" rx="5" ry="9" transform="rotate(10 110 88)" fill={palette.white} />
    <ellipse cx="124" cy="94" rx="6" ry="10" transform="rotate(45 124 94)" fill={palette.pink} />
    <ellipse cx="138" cy="100" rx="6" ry="11" transform="rotate(80 138 100)" fill={palette.pink} />

    {/* Lower Canopy Outer Leaves */}
    <ellipse cx="50" cy="115" rx="7" ry="12" transform="rotate(-85 50 115)" fill={palette.white} />
    <ellipse cx="68" cy="112" rx="6" ry="10" transform="rotate(-60 68 112)" fill={palette.pink} />
    <ellipse cx="132" cy="112" rx="6" ry="10" transform="rotate(60 132 112)" fill={palette.blue} />
    <ellipse cx="150" cy="115" rx="7" ry="12" transform="rotate(85 150 115)" fill={palette.white} />

    {/* Outer Accent Leaves */}
    <ellipse cx="44" cy="96" rx="5" ry="9" transform="rotate(-65 44 96)" fill={palette.blue} />
    <ellipse cx="156" cy="96" rx="5" ry="9" transform="rotate(65 156 96)" fill={palette.pink} />
    <ellipse cx="66" cy="128" rx="5" ry="9" transform="rotate(-75 66 128)" fill={palette.blue} />
    <ellipse cx="134" cy="128" rx="5" ry="9" transform="rotate(75 134 128)" fill={palette.pink} />

    {/* Stylized Human Figure / Tree Trunk in White Solid Silhouette */}
    {/* Head of the human figure */}
    <circle cx="100" cy="104" r="8.5" fill={palette.trunk} />

    {/* Reaching Arms & Graceful Trunk Silhouette */}
    <path
      d="M100 118C92 118 78 108 72 96C72 96 82 108 95 116C94 125 93 148 88 170L112 170C107 148 106 125 105 116C118 108 128 96 128 96C122 108 108 118 100 118Z"
      fill={palette.trunk}
    />
  </svg>
);

export const SunburstIcon: React.FC<{ color?: string; size?: number }> = ({ color = "#B37A56", size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="18" stroke={color} strokeWidth="2.5" />
    <circle cx="50" cy="50" r="10" fill={color} fillOpacity="0.3" />
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
      <line
        key={i}
        x1="50"
        y1={i % 2 === 0 ? "24" : "28"}
        x2="50"
        y2="12"
        stroke={color}
        strokeWidth={i % 2 === 0 ? "2.2" : "1.6"}
        strokeLinecap="round"
        transform={`rotate(${angle} 50 50)`}
      />
    ))}
  </svg>
);

export const SacredGeometryIcon: React.FC<{ color?: string; size?: number }> = ({ color = "#B37A56", size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="36" stroke={color} strokeWidth="1.8" />
    <circle cx="50" cy="50" r="24" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
    <polygon points="50,18 78,66 22,66" stroke={color} strokeWidth="1.8" />
    <polygon points="50,82 22,34 78,34" stroke={color} strokeWidth="1.8" />
    <circle cx="50" cy="50" r="4" fill={color} />
  </svg>
);

export const MandalaIcon: React.FC<{ color?: string; size?: number }> = ({ color = "#B37A56", size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="38" stroke={color} strokeWidth="1.5" />
    <circle cx="50" cy="50" r="28" stroke={color} strokeWidth="1.5" />
    <circle cx="50" cy="50" r="8" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="1.5" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <path
        key={i}
        d="M50 22 C44 32 44 42 50 50 C56 42 56 32 50 22 Z"
        stroke={color}
        strokeWidth="1.4"
        transform={`rotate(${angle} 50 50)`}
      />
    ))}
  </svg>
);

export const ButterflyIcon: React.FC<{ color?: string; size?: number }> = ({ color = "#B37A56", size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M50 22 C48 10 30 12 22 24 C14 36 24 50 50 48"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M50 22 C52 10 70 12 78 24 C86 36 76 50 50 48"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M50 48 C44 52 32 56 30 66 C28 74 38 76 48 60"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M50 48 C56 52 68 56 70 66 C72 74 62 76 52 60"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line x1="50" y1="18" x2="50" y2="64" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const HeartFlourishDivider: React.FC<{ color?: string; width?: number }> = ({
  color = "#B37A56",
  width = 120,
}) => (
  <div className="flex items-center justify-center gap-2 my-1" style={{ width: `${width}px` }}>
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-current to-current" style={{ color }} />
    <svg width="10" height="10" viewBox="0 0 24 24" fill={color} className="opacity-80">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-current to-current" style={{ color }} />
  </div>
);

export const BotanicalCornerFlourish: React.FC<{
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color?: string;
  size?: number;
}> = ({ position, color = "#B37A56", size = 48 }) => {
  const transformMap = {
    "top-left": "",
    "top-right": "scaleX(-1)",
    "bottom-left": "scaleY(-1)",
    "bottom-right": "scale(-1, -1)",
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: transformMap[position] }}
      className="pointer-events-none opacity-80"
    >
      {/* Corner main branch */}
      <path
        d="M6 54 C6 28 28 6 54 6"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Leaves along the branch */}
      <ellipse cx="14" cy="40" rx="4" ry="7" transform="rotate(-30 14 40)" fill={color} fillOpacity="0.35" />
      <ellipse cx="22" cy="28" rx="4" ry="7" transform="rotate(-45 22 28)" fill={color} fillOpacity="0.45" />
      <ellipse cx="38" cy="16" rx="4" ry="7" transform="rotate(-60 38 16)" fill={color} fillOpacity="0.35" />
      <ellipse cx="48" cy="10" rx="3" ry="5" transform="rotate(-75 48 10)" fill={color} fillOpacity="0.5" />
      {/* Small berries / buds */}
      <circle cx="18" cy="44" r="1.8" fill={color} />
      <circle cx="30" cy="30" r="1.8" fill={color} />
      <circle cx="44" cy="18" r="1.8" fill={color} />
    </svg>
  );
};

export const WatercolorCornerFoliage: React.FC<{
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color?: string;
  size?: number;
}> = ({ position, color = "#C5889A", size = 80 }) => {
  const transformMap = {
    "top-left": "",
    "top-right": "scaleX(-1)",
    "bottom-left": "scaleY(-1)",
    "bottom-right": "scale(-1, -1)",
  };

  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: transformMap[position] }}
      className="pointer-events-none opacity-60"
    >
      {/* Rose & Botanical watercolor spray */}
      <path
        d="M10 100 C15 60 40 30 90 10"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Soft Watercolor Leaves */}
      <path
        d="M25 80 C18 68 28 58 38 72 C35 78 28 82 25 80 Z"
        fill={color}
        fillOpacity="0.35"
      />
      <path
        d="M45 58 C38 46 50 36 60 48 C56 56 48 60 45 58 Z"
        fill={color}
        fillOpacity="0.45"
      />
      <path
        d="M68 35 C62 22 75 14 84 25 C80 32 72 36 68 35 Z"
        fill={color}
        fillOpacity="0.5"
      />
      {/* Flower Bud Petals at corner */}
      <ellipse cx="88" cy="16" rx="6" ry="9" transform="rotate(35 88 16)" fill={color} fillOpacity="0.6" />
      <ellipse cx="78" cy="8" rx="5" ry="8" transform="rotate(-15 78 8)" fill={color} fillOpacity="0.4" />
    </svg>
  );
};

export const GoldenOrnateFrame: React.FC<{
  color?: string;
  opacity?: number;
  inset?: number;
  cornerRadius?: number;
  customImage?: string;
}> = ({
  color = "#C89D66",
  opacity = 0.85,
  inset = 12,
  cornerRadius = 14,
  customImage,
}) => {
  if (customImage) {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-10 bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${customImage})`,
          opacity,
        }}
      />
    );
  }

  return (
    <div
      className="absolute pointer-events-none z-10 transition-all"
      style={{
        top: `${inset}px`,
        left: `${inset}px`,
        right: `${inset}px`,
        bottom: `${inset}px`,
        border: `1.2px solid ${color}`,
        borderRadius: `${cornerRadius}px`,
        opacity,
      }}
    >
      {/* Top Header Dots / Flourish on Frame */}
      <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 bg-transparent">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      </div>

      {/* Bottom Footer Dots on Frame */}
      <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 bg-transparent">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      </div>

      {/* Subtle Inner Line */}
      <div
        className="absolute inset-[3px]"
        style={{
          border: `0.75px solid ${color}`,
          borderRadius: `${Math.max(cornerRadius - 3, 2)}px`,
          opacity: 0.45,
        }}
      />
    </div>
  );
};

export const BotanicalBranchCorner: React.FC<{
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color?: string;
  size?: number;
  opacity?: number;
  customImage?: string;
}> = ({ position, color = "#C48B9F", size = 85, opacity = 0.85, customImage }) => {
  if (customImage) {
    const posStyles: Record<string, React.CSSProperties> = {
      "top-left": { top: 0, left: 0 },
      "top-right": { top: 0, right: 0 },
      "bottom-left": { bottom: 0, left: 0 },
      "bottom-right": { bottom: 0, right: 0 },
    };

    return (
      <img
        src={customImage}
        alt={`Botanical ${position}`}
        style={{
          ...posStyles[position],
          width: `${size}px`,
          opacity,
        }}
        className="absolute pointer-events-none z-10 object-contain"
        referrerPolicy="no-referrer"
      />
    );
  }

  // Realistic Watercolor Botanical Branch SVG matching the uploaded pink leaves
  const transformMap = {
    "top-left": "rotate(180deg) scaleX(-1)",
    "top-right": "rotate(180deg)",
    "bottom-left": "",
    "bottom-right": "scaleX(-1)",
  };

  const posClasses = {
    "top-left": "top-1 left-1",
    "top-right": "top-1 right-1",
    "bottom-left": "bottom-1 left-1",
    "bottom-right": "bottom-1 right-1",
  };

  return (
    <div
      className={`absolute ${posClasses[position]} pointer-events-none z-10`}
      style={{
        width: `${size}px`,
        height: `${size * 1.5}px`,
        opacity,
        transform: transformMap[position],
        transformOrigin: "bottom center",
      }}
    >
      <svg
        viewBox="0 0 100 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Main curved golden-bronze stem */}
        <path
          d="M80 150 C70 110 40 60 15 15"
          stroke="#C89D66"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />

        {/* Watercolor Pink/Rose Leaf Sprays */}
        {/* Bottom Leaves */}
        <path
          d="M68 135 C52 130 45 142 58 152 C65 148 70 140 68 135 Z"
          fill={color}
          fillOpacity="0.7"
        />
        <path
          d="M74 125 C88 118 92 132 82 140 C76 136 74 130 74 125 Z"
          fill={color}
          fillOpacity="0.6"
        />

        {/* Mid-Low Leaves */}
        <path
          d="M58 110 C40 100 35 116 48 126 C56 122 60 115 58 110 Z"
          fill={color}
          fillOpacity="0.75"
        />
        <path
          d="M62 98 C78 88 84 104 72 114 C66 109 63 102 62 98 Z"
          fill={color}
          fillOpacity="0.65"
        />

        {/* Middle Leaves */}
        <path
          d="M46 80 C26 68 22 86 36 96 C44 92 48 85 46 80 Z"
          fill={color}
          fillOpacity="0.8"
        />
        <path
          d="M48 68 C66 56 72 74 58 84 C52 79 49 72 48 68 Z"
          fill={color}
          fillOpacity="0.7"
        />

        {/* Upper Leaves */}
        <path
          d="M32 50 C16 38 12 54 24 64 C30 60 34 54 32 50 Z"
          fill={color}
          fillOpacity="0.85"
        />
        <path
          d="M35 38 C50 26 56 42 44 52 C38 47 36 41 35 38 Z"
          fill={color}
          fillOpacity="0.75"
        />

        {/* Tip Leaf */}
        <path
          d="M15 15 C8 4 20 -2 26 10 C24 16 18 18 15 15 Z"
          fill={color}
          fillOpacity="0.9"
        />

        {/* Golden Dust / Sparkle Dots */}
        <circle cx="28" cy="24" r="1.5" fill="#C89D66" fillOpacity="0.8" />
        <circle cx="42" cy="58" r="1.2" fill="#C89D66" fillOpacity="0.7" />
        <circle cx="58" cy="94" r="1.5" fill="#C89D66" fillOpacity="0.75" />
        <circle cx="20" cy="85" r="1.2" fill="#C89D66" fillOpacity="0.6" />
      </svg>
    </div>
  );
};

export const RenderOrnament: React.FC<{
  ornament: TopOrnament;
  color?: string;
  size?: number;
  className?: string;
}> = ({ ornament, color = "#B37A56", size = 28, className = "" }) => {
  switch (ornament) {
    case "lotus":
      return <LotusIcon color={color} size={size} className={className} />;
    case "tree":
      return <TreeOfLifeIcon color={color} size={size} className={className} />;
    case "sunburst":
      return <SunburstIcon color={color} size={size} />;
    case "sacred-geometry":
      return <SacredGeometryIcon color={color} size={size} />;
    case "mandala":
      return <MandalaIcon color={color} size={size} />;
    case "butterfly":
      return <ButterflyIcon color={color} size={size} />;
    case "none":
      return null;
    default:
      return <LotusIcon color={color} size={size} className={className} />;
  }
};
