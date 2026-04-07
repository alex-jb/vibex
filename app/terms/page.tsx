export default function TermsPage() {
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
          {">"} VIBEX://TERMS
        </span>
        <span className="font-pixel" style={{ fontSize: 7, color: "#333" }}>━━━</span>
      </div>

      {/* Body */}
      <div className="rpgui-container framed" style={{ padding: 24 }}>
        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          服务条款
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          欢迎使用 VibeX 平台。使用本平台即表示您同意遵守以下条款。您不得利用本平台进行任何违法行为或损害他人权益的活动。我们保留随时修改服务条款的权利。
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          知识产权
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          VibeX 平台采用 source-available 许可证。用户在平台上创建的项目归用户所有，但平台有权展示和推广用户公开发布的内容。
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          免责声明
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          本平台的 AI 功能（包括战斗系统、项目评估等）仅供娱乐和参考，不构成专业建议。AI 生成的内容可能存在不准确之处，用户应自行判断。
        </p>

        <p className="font-pixel" style={{ fontSize: 7, color: "#555", marginTop: 32 }}>
          最后更新：2026-04-06
        </p>
      </div>
    </div>
  );
}
