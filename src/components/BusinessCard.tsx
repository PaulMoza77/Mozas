import React from "react";

export interface BusinessCardProps {
  logo?: React.ReactNode;
  title: string;
  desc: string;
  regions: string[];
  url?: string; // ✅ add
  onOverview?: () => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  logo,
  title,
  desc,
  regions,
  url,
  onOverview,
}) => {
  const isClickable = Boolean(url);

  const handleCardClick = () => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`card ${isClickable ? "card--clickable" : ""}`}
      role={isClickable ? "link" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (!isClickable) return;
        if (e.key === "Enter" || e.key === " ") handleCardClick();
      }}
    >
      <div className="card-logo">{logo}</div>

      <div className="card-title">{title}</div>
      <div className="card-desc">{desc}</div>

      <div className="overview-row">
        <button
          type="button"
          className="btn"
          onClick={(e) => {
            e.stopPropagation(); // ✅ nu declanșează click-ul pe card
            if (url) window.open(url, "_blank", "noopener,noreferrer");
            else onOverview?.();
          }}
        >
          Overview
        </button>

        <div className="regions">
          {regions.map((region) => (
            <span className="badge" key={region}>
              {region}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
