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
      .select(
        "id,name,slug,description,logo_url,overview_url,badges,sort_order,is_active,created_at"
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error) setBrands((data || []) as BrandRow[]);
    setLoading(false);
  }

  useEffect(() => {
    loadBrands();

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
        style={{
          textAlign: "center",
          maxWidth: 900,
          margin: "auto",
          marginTop: -20,
        }}
      >
        <p style={{ fontSize: 18, color: "#475569", lineHeight: 1.6 }}>
          THEMOZAS. brings together a suite of high-performance digital ventures
          built for global impact. From mobility and AI-powered creativity to
          branding and digital growth, every brand in our ecosystem follows one
          vision: fast execution, premium experiences, and scalable technology.
        </p>
      </section>

      <section className="section">
        <h2 style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=200"
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
          Businesses Inside THEMOZAS.
        </h2>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 18,
            alignItems: "stretch",
          }}
        >
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 22,
                    background: "white",
                    padding: 18,
                    minHeight: 340,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      borderRadius: 18,
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      height: 84,
                    }}
                  />
                  <div
                    style={{
                      marginTop: 18,
                      height: 20,
                      width: "60%",
                      background: "#f1f5f9",
                      borderRadius: 10,
                    }}
                  />
                  <div
                    style={{
                      marginTop: 12,
                      height: 12,
                      width: "92%",
                      background: "#f1f5f9",
                      borderRadius: 10,
                    }}
                  />
                  <div
                    style={{
                      marginTop: 8,
                      height: 12,
                      width: "86%",
                      background: "#f1f5f9",
                      borderRadius: 10,
                    }}
                  />
                  <div style={{ marginTop: "auto", paddingTop: 18, display: "flex", gap: 10 }}>
                    <div
                      style={{
                        height: 44,
                        width: 150,
                        background: "#0f172a",
                        borderRadius: 14,
                        opacity: 0.2,
                      }}
                    />
                    <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                      <div
                        style={{
                          height: 40,
                          width: 90,
                          background: "#f1f5f9",
                          borderRadius: 999,
                        }}
                      />
                      <div
                        style={{
                          height: 40,
                          width: 90,
                          background: "#f1f5f9",
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : hasBrands ? (
            brands.map((b) => (
              <div
                key={b.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 22,
                  background: "white",
                  padding: 18,
                  minHeight: 340,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* logo header */}
                <div
                  style={{
                    borderRadius: 18,
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    height: 84,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {b.logo_url ? (
                    <img
                      src={b.logo_url}
                      alt={b.name}
                      style={{ height: 56, width: "80%", objectFit: "contain" }}
                    />
                  ) : (
                    <div style={{ fontWeight: 900, fontSize: 32, color: "#0f172a" }}>
                      {String(b.name || "B")
                        .trim()
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                {/* name */}
                <h3
                  style={{
                    margin: "18px 0 8px",
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: -0.2,
                  }}
                >
                  {b.name}
                </h3>

                {/* description */}
                <p style={{ margin: 0, color: "#475569", lineHeight: 1.65, fontSize: 16 }}>
                  {b.description}
                </p>

                {/* bottom row */}
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <a
                    href={b.overview_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "12px 18px",
                      borderRadius: 14,
                      background: "#0f172a",
                      color: "white",
                      fontWeight: 800,
                      textDecoration: "none",
                      minWidth: 150,
                    }}
                  >
                    Overview
                  </a>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginLeft: "auto",
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    {(b.badges || []).map((x) => (
                      <span
                        key={`${b.id}-${x}`}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 999,
                          background: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          color: "#334155",
                          fontWeight: 800,
                          fontSize: 14,
                        }}
                      >
                        {x}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
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
