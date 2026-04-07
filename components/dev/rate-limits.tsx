"use client";

import { useLang } from "@/lib/i18n";

export function RateLimits() {
  const { t } = useLang();

  return (
    <section>
      <span className="font-pixel" style={{ fontSize: 9, color: "#9D00FF" }}>
        {">"} {t("dev.rateLimits")}
      </span>
      <div className="rpgui-container framed-golden" style={{ marginTop: 12, padding: 16, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {[t("dev.plan"), t("dev.reqPerDay"), t("dev.tokensPerDay"), ""].map((h, i) => (
                <th
                  key={i}
                  className="font-pixel"
                  style={{
                    fontSize: 7,
                    color: "#FACC15",
                    textAlign: "left",
                    padding: "8px 12px",
                    borderBottom: "2px solid #3A3A40",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { plan: "Free", req: "100", tokens: "10K", btnClass: "" },
              { plan: "Pro", req: "10,000", tokens: "1M", btnClass: "is-primary" },
              { plan: "Enterprise", req: t("dev.unlimited"), tokens: t("dev.unlimited"), btnClass: "is-success" },
            ].map((row) => (
              <tr key={row.plan} style={{ borderBottom: "1px solid #2A2A30" }}>
                <td className="font-pixel" style={{ fontSize: 8, color: "#E8E8EC", padding: "10px 12px" }}>
                  {row.plan}
                </td>
                <td className="font-mono" style={{ fontSize: 12, color: "#8888A0", padding: "10px 12px" }}>
                  {row.req}
                </td>
                <td className="font-mono" style={{ fontSize: 12, color: "#8888A0", padding: "10px 12px" }}>
                  {row.tokens}
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                  {row.plan !== "Free" && (
                    <button className={`nes-btn ${row.btnClass}`} style={{ fontSize: 8, padding: "4px 12px" }}>
                      {t("dev.upgrade")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
