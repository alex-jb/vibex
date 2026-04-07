export default function PrivacyPage() {
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
          {">"} VIBEX://PRIVACY
        </span>
        <span className="font-pixel" style={{ fontSize: 7, color: "#333" }}>━━━</span>
      </div>

      {/* Body */}
      <div className="rpgui-container framed" style={{ padding: 24 }}>
        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          数据收集
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          我们收集的数据包括：账户信息（用户名、邮箱）、项目数据（代码、描述、配置）、使用数据（页面浏览、功能使用频率）。我们不会收集不必要的个人信息。
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          数据使用
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          收集的数据用于：提供和改进平台服务、生成排行榜和统计数据、优化 AI 功能体验、发送服务相关通知。我们不会将您的数据出售给第三方。
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          第三方服务
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          本平台使用以下第三方服务：Supabase（数据库与身份验证）、Anthropic Claude API（AI 功能）、Vercel（托管与部署）。这些服务各自有独立的隐私政策。
        </p>

        <h2 className="font-pixel" style={{ fontSize: 12, color: "#39FF14", marginBottom: 16 }}>
          联系我们
        </h2>
        <p style={{ color: "#8888A0", fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          如有隐私相关问题，请通过 GitHub Issues 联系我们，或发送邮件至项目维护者。
        </p>

        <p className="font-pixel" style={{ fontSize: 7, color: "#555", marginTop: 32 }}>
          最后更新：2026-04-06
        </p>
      </div>
    </div>
  );
}
