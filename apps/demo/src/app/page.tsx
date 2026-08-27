import { type FlagKey, flagDefinitions, getFlags } from "@repo/flags";
import { FlagsProvider } from "@repo/flags/react";
import { ClientFlags, FeatureShowcase } from "@/components/ClientFlags";

export default function Page() {
  const flags = getFlags();

  return (
    <FlagsProvider value={flags}>
      <div className="container">
        <h1>Flags Demo</h1>
        <p className="subtitle">
          Minimal app showing <code>@repo/flags</code> shared package usage.
          Same package as the slides app.
        </p>

        <h2>Server-evaluated flags</h2>
        <p className="subtitle">
          Evaluated in this server component via <code>getFlags()</code>, then
          passed to the client through <code>&lt;FlagsProvider&gt;</code>.
        </p>
        {(Object.keys(flagDefinitions) as FlagKey[]).map((key) => (
          <div key={key} className="card">
            <div className="flag-row">
              <div>
                <div className="flag-name">{key}</div>
                <div className="flag-desc">
                  {flagDefinitions[key].description}
                </div>
              </div>
              <span
                className={`badge ${flags[key] ? "badge-on" : "badge-off"}`}
              >
                {flags[key] ? "ON" : "OFF"}
              </span>
            </div>
          </div>
        ))}

        <h2>Client-side consumption</h2>
        <p className="subtitle">
          These read from <code>useFlag()</code> / <code>useFlags()</code> — no
          server access, just the resolved booleans from the provider.
        </p>
        <ClientFlags />

        <h2>Feature toggling</h2>
        <FeatureShowcase />

        <h2>How it works</h2>
        <div className="card">
          <div className="label">Flow</div>
          <ol style={{ paddingLeft: "1.25rem", fontSize: "0.85rem" }}>
            <li>
              <code>packages/flags</code> defines all flags (single source of
              truth)
            </li>
            <li>
              Server component calls <code>getFlags()</code> — reads{" "}
              <code>process.env</code> for overrides
            </li>
            <li>
              Resolved booleans passed to <code>&lt;FlagsProvider&gt;</code>
            </li>
            <li>
              Client components call <code>useFlag()</code> — no env access
            </li>
          </ol>
        </div>

        <div className="card" style={{ marginTop: "1.5rem" }}>
          <div className="label">Try it</div>
          <div style={{ fontSize: "0.85rem" }}>
            Create <code>.env.local</code> in this app:
            <pre
              style={{
                marginTop: "0.5rem",
                padding: "0.75rem",
                background: "#f3f4f6",
                borderRadius: "0.375rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.8rem",
                overflowX: "auto",
              }}
            >
              {`FLAGS_NEW_HOMEPAGE=true
FLAGS_EXPERIMENTAL_SEARCH=true`}
            </pre>
            <div style={{ marginTop: "0.5rem", color: "#888" }}>
              Restart <code>pnpm dev</code> and reload — the feature blocks
              above will appear.
            </div>
          </div>
        </div>
      </div>
    </FlagsProvider>
  );
}
