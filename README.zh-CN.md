<p align="right">
  <a href="./README.md">English</a> · <strong>中文</strong>
</p>

<p align="center">
  <a href="https://www.vibexforge.com">
    <img src="docs/screenshots-v3/01-landing.png" width="820" alt="VibeXForge — 给独立 AI 创作者的多渠道发行放大器" />
  </a>
</p>

<h1 align="center">VibeXForge</h1>

<p align="center">
  <strong>给独立 AI 创作者的多渠道发行放大器。</strong><br/>
  <sub>提交一次 AI 作品,我们的 agent 在 10 秒内自动生成 10+ 篇平台原生帖子 —— X、Reddit、Hacker News、Dev.to、LinkedIn、Bluesky、Threads、小红书、即刻、知乎、B 站。审核、修改、一键发布,跨平台 engagement 一个 dashboard 全看见。</sub>
</p>

<p align="center">
  <a href="https://www.vibexforge.com/launch"><img src="https://img.shields.io/badge/▶_提交项目-Beta_期免费-FF4500?style=for-the-badge" alt="提交项目" /></a>
  <a href="#-本地启动"><img src="https://img.shields.io/badge/⚡_本地启动-30_秒-39FF14?style=for-the-badge" alt="本地启动" /></a>
  <a href="https://github.com/alex-jb/vibex"><img src="https://img.shields.io/badge/⭐_点亮-GitHub-FACC15?style=for-the-badge" alt="Star" /></a>
</p>

---

## 真实痛点

你 vibe-coded 了一个 AI 作品。开发是简单的部分。

接下来是分发。同一个产品,10 个平台 10 套规矩:X 限 270 字、Reddit 要不商业化的口吻、Hacker News 要技术深度、小红书要 emoji + 种草氛围、LinkedIn 要叙事、Dev.to 要长文。10 个版本认真写完,3-4 小时没了 —— 而那时你刚 ship 完产品,人已经空了。

独立开发者最后只发一个最熟的平台。曝光直接坍塌。

## 核心闭环

```
提交 URL  →  Claude 并行生成 10+ 张平台原生草稿(~10 秒)
          →  逐张审核、内联编辑、批准
          →  一键打开平台,文案已预填
          →  标记已发布,粘贴 URL
          →  Cron 每 6 小时抓 engagement
          →  Dashboard 显示哪个渠道转化率最高
```

**原生中英双语。** 一次提交同时生成 EN + ZH 草稿 —— 西方独立黑客 + 国内 AI 创作者(小红书 / 即刻 / 知乎 / B 站)同时触达,不用重写。

**平台专属 prompt。** 每张草稿都用平台专属 system prompt:hook 规则、长度上限、反营销腔、数字不重复、强制输出语言。所有规则都是 dogfood 跑出来调出来的。

**真实 engagement 跟踪。** Reddit / HN / Dev.to / Bluesky / X 公共 API scraper。Cron 写 append-only snapshot,看到的是 30 天曲线,不是当前快照。

---

## Demo

> **生产环境:** [vibexforge.com](https://www.vibexforge.com) —— GitHub / Google 登录,提交任意 URL,10 秒拿到 10+ 张平台原生草稿。

---

## 本地启动

**30 秒跑起来。零配置。** 不用 API key,不用数据库,不用注册。

```bash
git clone https://github.com/alex-jb/vibex.git
cd vibex
npm install
npm run dev
```

打开 http://localhost:3000。应用进入 **mock 模式**,内置示例数据。

<details>
<summary><strong>想跑真实数据?接 Supabase + Claude(可选)</strong></summary>

```bash
cp .env.local.example .env.local
# 填入:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   ANTHROPIC_API_KEY        # Claude Sonnet 4.6 写草稿
#   OPENAI_API_KEY           # gpt-image-2 生成小红书封面
#   BLOB_READ_WRITE_TOKEN    # Vercel Blob 存封面图
#   CRON_SECRET              # cron 路由的 Bearer token
#   SUPABASE_SERVICE_ROLE_KEY # cron 写库
npm run dev
```

`.private/migrations/*.sql` 里的 SQL 通过 Supabase Dashboard SQL 编辑器运行。完整步骤见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

</details>

---

## 技术栈

| 层 | 选择 | 原因 |
|---|---|---|
| 框架 | Next.js 16(App Router + Turbopack)| RSC + streaming + 必要时 edge runtime |
| 语言 | TypeScript 5(strict)| 大胆重构 |
| UI | React 19 + Tailwind v4 + Framer Motion | 零配置、快、平滑 |
| 数据库 | Supabase(Postgres + RLS + Realtime)| 一套栈、一套 auth、realtime 草稿 |
| Auth | Supabase Auth(GitHub + Google + PKCE)| Cookies 不是 localStorage |
| 草稿 | Claude Sonnet 4.6 + prompt cache | 并行调用,~10 秒 10+ 张 |
| 翻译 | Claude Sonnet 4.6(每日 batch)| EN ↔ ZH 创作者内容自动翻译 |
| 视觉 | OpenAI gpt-image-2 | 按需生成小红书封面 |
| 存储 | Vercel Blob | 封面图 + demo 视频 |
| 邮件 | Resend + Vercel Cron | 欢迎 / 草稿就绪 / 周报 / 每日总结 |
| Engagement | 公共 scraper(Reddit/HN/Dev.to/Bluesky/X)| 每 6 小时跑,append-only 历史 |
| 监控 | Sentry + HyperDX | 服务端错误 + 浏览器 session replay |
| 分析 | OpenPanel | 无 cookie 的产品分析 |
| 部署 | Vercel + GitHub Actions | `git push` = prod |

---

## 路线图

**已上线**
- [x] 提交 URL → Claude 写 10+ 张平台专属草稿,~10 秒
- [x] HITL 审核 UI:内联编辑、单张 re-roll、状态筛选
- [x] 一键发布 —— 文案自动复制 + 平台 intent URL 打开
- [x] Engagement 跟踪 —— 6 小时 cron 抓 Reddit / HN / Dev.to / Bluesky / X
- [x] 跨平台 analytics + 30 天 sparkline + 最强渠道徽章
- [x] 原生中英双语(UI + 创作者内容每日 cron 自动翻译)
- [x] 每日 Claude 配额(per-creator 原子 Postgres RPC)
- [x] 小红书封面图生成(gpt-image-2 + Vercel Blob)
- [x] PWA 可安装(manifest + 极简 SW、无 HTML 缓存)
- [x] 邮件留存闭环(welcome / drafts-ready / daily summary / weekly digest)
- [x] /admin/metrics launch-day 监控

**计划中**
- [ ] Stripe Connect 收款分账(85/15)
- [ ] v2 平台视觉(X OG card、B 站缩略图)
- [ ] 真 OAuth 自动发布(X / Reddit / Bluesky API)
- [ ] 多账号支持(creator 的个人 X + 品牌 X)
- [ ] Engagement 突破阈值时推送通知

---

## 参与贡献

PR 欢迎。本地开发、分支 / commit 规范、调试循环见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

发现安全问题?请看 [SECURITY.md](./SECURITY.md) —— 不要直接开 public issue。

## 开源协议

Source Available —— [LICENSE](./LICENSE)。免费阅读、fork、自部署。
商业转发需许可 —— DM [@alex-jb](https://github.com/alex-jb)。

## 独立开发者

[Alex(@alex-jb)](https://github.com/alex-jb) —— solo indie AI 创作者。VibeXForge 这个工具的存在,是因为我自己 build 了 6 个月的 AI gallery 只拿到 5 个用户,distribution 把我搞死了。所以我做了一个我自己想要的工具。

能用就[告诉我](https://www.vibexforge.com)(DM 开放)。不能用就大声告诉我。
