import React from 'react';

interface HeroProps {
  title: string;
  subtitle: string;
  imageUrl: string;
}

export const Hero: React.FC<HeroProps> = ({ title, subtitle, imageUrl }) => (
  <header className="hero">
    <div className="hero-text">
      <div className="hero-title" style={{ fontWeight: 300, letterSpacing: '0.28em', fontFamily: 'Arial, sans-serif', fontSize: 48 }}>{title}</div>
      <div className="hero-subtitle">{subtitle}</div>
    </div>
    <div className="hero-image">
      <div className="hero-image-inner">
        <img src={imageUrl} alt="Hero" />
      </div>
    </div>
  </header>
);
