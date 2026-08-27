"use client";

import { useFlag, useFlags } from "@repo/flags/react";

export function ClientFlags() {
  const allFlags = useFlags();

  return (
    <div>
      <div className="label">Client-side (via useFlags)</div>
      {Object.entries(allFlags).map(([key, value]) => (
        <div key={key} className="card">
          <div className="flag-row">
            <div>
              <div className="flag-name">{key}</div>
            </div>
            <span className={`badge ${value ? "badge-on" : "badge-off"}`}>
              {value ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeatureShowcase() {
  const newHomepage = useFlag("newHomepage");
  const experimentalSearch = useFlag("experimentalSearch");

  return (
    <div>
      <div className="label">Conditional rendering (via useFlag)</div>
      {newHomepage && (
        <div className="feature">
          <strong>New Homepage</strong> is enabled — this block only renders
          because <code>useFlag("newHomepage")</code> returned <code>true</code>
          .
        </div>
      )}
      {experimentalSearch && (
        <div className="feature">
          <strong>Experimental Search</strong> is enabled — AI-powered search
          would appear here.
        </div>
      )}
      {!newHomepage && !experimentalSearch && (
        <div className="card" style={{ textAlign: "center" }}>
          <span style={{ color: "#888", fontSize: "0.85rem" }}>
            No flags are on. Set <code>FLAGS_NEW_HOMEPAGE=true</code> or{" "}
            <code>FLAGS_EXPERIMENTAL_SEARCH=true</code> and restart.
          </span>
        </div>
      )}
    </div>
  );
}
