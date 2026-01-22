import React from 'react';
import { Hero } from '../components/Hero';
import { BusinessCards } from '../components/BusinessCards';
import { Footer } from '../components/Footer';
import '../styles/ShowPage.css';

export const Home: React.FC = () => (
  <>
    <Hero
      title="THEMOZAS."
      subtitle="A central gateway connecting mobility, AI creativity, and digital brands — built to prove that with the right systems, everything is possible."
      imageUrl="https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=2000"
    />
    <section className="section" style={{ textAlign: 'center', maxWidth: 900, margin: 'auto', marginTop: -20 }}>
      <p style={{ fontSize: 18, color: '#475569', lineHeight: 1.6 }}>
        THEMOZAS. brings together a suite of high‑performance digital ventures built for global impact.
        From mobility and AI‑powered creativity to branding and digital growth, every brand in our ecosystem
        follows one vision: fast execution, premium experiences, and scalable technology.
      </p>
    </section>
    <section className="section">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=200" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
        Businesses Inside THEMOZAS.
      </h2>
      <BusinessCards />
    </section>
    <Footer />
  </>
);
