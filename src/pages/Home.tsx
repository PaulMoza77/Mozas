// src/pages/Home.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Hero } from "../components/Hero";
import { Footer } from "../components/Footer";
import { supabase } from "../lib/supabase";
import "../styles/ShowPage.css";

type BrandRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  overview_url: string;
  badges: string[];
  sort_order: number;
  is_active: boolean;
};


export const Home: React.FC = () => {
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadBrands() {
    setLoading(true);
    const { data, error } = await supabase
      .from("mozas_brands")
      .select("id,name,slug,description,logo_url,overview_url,badges,sort_order,is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error) setBrands((data || []) as BrandRow[]);
    setLoading(false);
  }

  useEffect(() => {
    loadBrands();

    // live refresh when admin saves (realtime)
    const channel = supabase
      .channel("mozas_brands_home")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mozas_brands" },
        () => loadBrands()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const hasBrands = useMemo(() => brands.length > 0, [brands]);

  return (
    <>
      <Hero
        title="THEMOZAS."
        subtitle="A central gateway connecting mobility, AI creativity, and digital brands — built to prove that with the right systems, everything is possible."
        imageUrl="https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=2000"
      />

      <section
        className="section"
        style={{ textAlign: "center", maxWidth: 900, margin: "auto", marginTop: -20 }}
      >
        <p style={{ fontSize: 18, color: "#475569", lineHeight: 1.6 }}>
          THEMOZAS. brings together a suite of high-performance digital ventures built for global impact.
          From mobility and AI-powered creativity to branding and digital growth, every brand in our ecosystem
          follows one vision: fast execution, premium experiences, and scalable technology.
        </p>
      </section>

      <section className="section">
        <h2 style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=200"
            style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }}
          />
          Businesses Inside THEMOZAS.
        </h2>

        {/* Cards (from Admin / Supabase) */}
        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
          }}
        >
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 18,
                    background: "white",
                    padding: 18,
                    minHeight: 220,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 14, width: "60%", background: "#f1f5f9", borderRadius: 8 }} />
                      <div style={{ height: 10, width: "40%", background: "#f1f5f9", borderRadius: 8, marginTop: 8 }} />
                    </div>
                  </div>
                  <div style={{ height: 10, width: "95%", background: "#f1f5f9", borderRadius: 8 }} />
                  <div style={{ height: 10, width: "85%", background: "#f1f5f9", borderRadius: 8, marginTop: 8 }} />
                  <div style={{ height: 10, width: "70%", background: "#f1f5f9", borderRadius: 8, marginTop: 8 }} />
                  <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                    <div style={{ height: 24, width: 64, background: "#f1f5f9", borderRadius: 999 }} />
                    <div style={{ height: 24, width: 64, background: "#f1f5f9", borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </>
          ) : hasBrands ? (
            brands.map((b) => (
              <a
                key={b.id}
                href={b.overview_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid #e2e8f0",
                  borderRadius: 22,
                  background: "white",
                  padding: 18,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                  transition: "transform 0.12s ease, box-shadow 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 18px 45px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0px)";
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 10px 30px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {b.logo_url ? (
                      <img
                        src={b.logo_url}
                        alt={b.name}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    ) : (
                      <span style={{ fontWeight: 800, color: "#0f172a" }}>
                        {String(b.name || "B").trim().slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{b.name}</h3>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#0f172a",
                          background: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          padding: "6px 10px",
                          borderRadius: 999,
                        }}
                      >
                        Overview →
                      </span>
                    </div>

                    {b.badges?.length ? (
                      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {b.badges.map((x) => (
                          <span
                            key={`${b.id}-${x}`}
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#334155",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              padding: "6px 10px",
                              borderRadius: 999,
                            }}
                          >
                            {x}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <p
                  style={{
                    marginTop: 14,
                    marginBottom: 0,
                    color: "#475569",
                    lineHeight: 1.55,
                    fontSize: 14,
                  }}
                >
                  {b.description}
                </p>
              </a>
            ))
          ) : (
            <div
              style={{
                gridColumn: "1 / -1",
                border: "1px solid #e2e8f0",
                background: "white",
                borderRadius: 22,
                padding: 18,
                color: "#475569",
              }}
            >
              No businesses yet. Add your first one in <b>/admin/brands</b>.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};
