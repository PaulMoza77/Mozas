import React from 'react';
import { BusinessCard, type BusinessCardProps } from './BusinessCard';

const businesses: BusinessCardProps[] = [
  {
    title: 'Volocar',
    desc: 'Premium mobility marketplace across the UAE & EU: Rentals, Monthly, Sales, Concierge & Elite Services.',
    regions: ['UAE', 'EU'],
  },
  {
    title: 'TheDigitalGifter',
    desc: 'AI‑powered greeting cards, videos & custom image creation. Personalized gifts in seconds.',
    regions: ['Global'],
  },
  {
    title: 'Starscale',
    desc: 'Creative digital agency & personal branding accelerator: content, ads, growth, performance.',
    regions: ['Global'],
  },
  {
    title: 'BRNDLY.',
    desc: 'Branding & creative asset studio: logos, packaging, product visuals, and brand systems.',
    regions: ['EU', 'EAU'],
  },
];

export const BusinessCards: React.FC = () => (
  <div className="cards">
    {businesses.map((biz) => (
      <BusinessCard key={biz.title} {...biz} />
    ))}
  </div>
);
