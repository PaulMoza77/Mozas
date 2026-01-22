import React from "react";
import { BusinessCard, type BusinessCardProps } from "./BusinessCard";

const businesses: BusinessCardProps[] = [
  {
    title: "Volocar",
    desc: "Premium mobility marketplace across the UAE & EU: Rentals, Monthly, Sales, Concierge & Elite Services.",
    regions: ["UAE", "EU"],
    url: "https://volocar.eu",
    logo: (
      <img
        src="/assets/volocar-logo.png"
        alt="Volocar"
        loading="lazy"
      />
    ),
  },
  {
    title: "TheDigitalGifter",
    desc: "AI-powered greeting cards, videos & custom image creation. Personalized gifts in seconds.",
    regions: ["Global"],
    url: "https://thedigitalgifter.com",
    logo: (
      <img
        src="/assets/thedigitalgifter-logo.png"
        alt="TheDigitalGifter"
        loading="lazy"
      />
    ),
  },
  {
    title: "Starscale",
    desc: "Creative digital agency & personal branding accelerator: content, ads, growth, performance.",
    regions: ["Global"],
    url: "https://starscale.eu",
    logo: (
      <img
        src="/assets/starscale-logo.png"
        alt="Starscale"
        loading="lazy"
      />
    ),
  },
  {
    title: "BRNDLY.",
    desc: "Branding & creative asset studio: logos, packaging, product visuals, and brand systems.",
    regions: ["EU", "EAU"],
    logo: (
      <img
        src="/assets/brndly-logo.png"
        alt="BRNDLY."
        loading="lazy"
      />
    ),
  },
];

export const BusinessCards: React.FC = () => {
  return (
    <div className="cards">
      {businesses.map((biz) => (
        <BusinessCard key={biz.title} {...biz} />
      ))}
    </div>
  );
};
