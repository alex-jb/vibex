export default function AboutPage() {
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
          {">"} VIBEX://ABOUT
        </span>
        <span className="font-pixel" style={{ fontSize: 7, color: "#333" }}>━━━</span>
      </div>

      {/* Body */}
      <div className="rpgui-container framed" style={{ padding: 24 }}>
        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          关于 VibeX
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          VibeX 是一个 16-bit RPG 风格的 AI 创作者经济平台。在这里，AI 项目化身为 RPG 英雄，拥有属性、等级和进化系统。创作者可以提交项目、参与竞技场战斗、攀登排行榜，打造属于自己的 AI 传奇。
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          技术栈
        </h2>
        <ul style={{ color: "#8888A0", fontSize: 14, lineHeight: 2, marginBottom: 24, paddingLeft: 20 }}>
          <li>Next.js 16 + React 19</li>
          <li>Tailwind CSS 4</li>
          <li>Supabase (Database & Auth)</li>
          <li>Claude API (AI Features)</li>
          <li>Vercel (Hosting)</li>
        </ul>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          开源
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          VibeX 是一个 source-available 项目。欢迎在 GitHub 上查看源码、提交 Issue 和贡献代码。
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          团队
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 32 }}>
          Built by Orallexa
        </p>

        <a
          href="https://github.com/orallexa/vibecode-hunt"
          target="_blank"
          rel="noopener noreferrer"
          className="nes-btn is-primary"
          style={{ fontSize: 10, padding: "10px 20px" }}
        >
          GitHub
        </a>
      </div>
    </div>
  );
}
