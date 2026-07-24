import React from 'react';

const KartaLogoIcon = ({ className = "w-10 h-10" }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="kartaBg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#002642" />
        <stop offset="1" stopColor="#02040F" />
      </linearGradient>
      <linearGradient id="kartaGold" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFC107" />
        <stop offset="1" stopColor="#E59500" />
      </linearGradient>
      <linearGradient id="kartaRing" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E59500" />
        <stop offset="0.5" stopColor="#840032" />
        <stop offset="1" stopColor="#38BDF8" />
      </linearGradient>
    </defs>
    
    {/* Clean Dark Circle Badge */}
    <circle cx="50" cy="50" r="50" fill="url(#kartaBg)" />
    
    {/* Double Chevron Forward Arrows */}
    <path
      d="M33 32L51 50L33 68"
      stroke="url(#kartaGold)"
      strokeWidth="7.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M51 32L69 50L51 68"
      stroke="url(#kartaGold)"
      strokeWidth="7.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default KartaLogoIcon;
