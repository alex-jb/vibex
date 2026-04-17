import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Terminal Header */}
      <div
        style={{
          background: "#0A0A0C",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid #2A2A30",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, background: "#FF4500", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#FACC15", display: "inline-block" }} />
          <span style={{ width: 10, height: 10, background: "#39FF14", display: "inline-block" }} />
        </div>
        <span className="font-pixel" style={{ fontSize: 8, color: "#555", letterSpacing: 2 }}>
          {">"} VIBEX://CONTACT
        </span>
        <span className="font-pixel" style={{ fontSize: 7, color: "#333" }}>━━━</span>
      </div>

      <div className="rpgui-container framed" style={{ padding: 24 }}>
        <h1 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          Contact
        </h1>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          VibeX is built by <strong>@alex-jb</strong>, a solo founder. The fastest ways to reach
          the project:
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 12 }}>
          Channels
        </h2>
        <ul style={{ color: "#8888A0", fontSize: 14, lineHeight: 2, marginBottom: 24, paddingLeft: 20 }}>
          <li>
            <strong>GitHub issues</strong>:{" "}
            <Link
              href="https://github.com/alex-jb/vibex/issues"
              style={{ color: "#22D3EE" }}
              target="_blank"
              rel="noopener"
            >
              github.com/alex-jb/vibex/issues
            </Link>{" "}
            — bugs, feature requests, launch questions
          </li>
          <li>
            <strong>Email</strong>: <span style={{ color: "#E5E7EB" }}>alex@vibexforge.com</span>{" "}
            — press, partnerships, business
          </li>
        </ul>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 12 }}>
          Not affiliated with
        </h2>
        <p style={{ color: "#8888A0", fontSize: 13, lineHeight: 1.8, marginBottom: 16 }}>
          &ldquo;VibeX&rdquo; is a common name. This site (
          <strong>vibexforge.com</strong>) is not affiliated with{" "}
          <code style={{ color: "#C77DFF" }}>tiwater/vibex</code>,{" "}
          <code style={{ color: "#C77DFF" }}>dustland/vibex</code>,{" "}
          <code style={{ color: "#C77DFF" }}>sethdford/vibex-*</code>, or any company named
          &ldquo;VibeX Ventures.&rdquo; Our canonical GitHub repo is{" "}
          <Link href="https://github.com/alex-jb/vibex" style={{ color: "#22D3EE" }} target="_blank" rel="noopener">
            alex-jb/vibex
          </Link>
          .
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 12 }}>
          Response time
        </h2>
        <p style={{ color: "#8888A0", fontSize: 13, lineHeight: 1.8 }}>
          Issues and email are read within 48 hours during weekdays. VibeX is a solo project, so
          critical bugs ship faster than polite pings. If something is broken, open an issue with
          repro steps and it gets priority.
        </p>
      </div>
    </div>
  );
}
