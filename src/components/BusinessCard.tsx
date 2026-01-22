import React from 'react';

export interface BusinessCardProps {
  logo?: React.ReactNode;
  title: string;
  desc: string;
  regions: string[];
  onOverview?: () => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ logo, title, desc, regions, onOverview }) => (
  <div className="card">
    <div className="card-logo">{logo}</div>
    <div className="card-title">{title}</div>
    <div className="card-desc">{desc}</div>
    <div className="overview-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, gap: 12 }}>
      <a className="btn" onClick={onOverview}>Overview</a>
      <div className="regions" style={{ marginTop: 0 }}>
        {regions.map(region => (
          <div className="badge" key={region}>{region}</div>
        ))}
      </div>
    </div>
  </div>
);
