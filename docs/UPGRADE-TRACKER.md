# VibeX 升级追踪清单

> 最后更新: 2026-04-06 | 总计 31 项 | ✅ 全部完成 + Buddy 系统 + 最终 polish

---

## 🔴 紧急修复 (5 项)

- [x] **#1 404 页面** — 自定义 not-found.tsx，RPG 终端风格 `5min` _(进行中)_
- [x] **#2 API 输入验证** — 所有 API 加长度/类型/格式校验，防 XSS `3h` _(进行中)_
- [x] **#3 评论 API 认证** — POST 验证用户身份，防冒充 `1h` _(进行中)_
- [x] **#4 API 速率限制** — AI 端点 20/min，评论 10/min `2h` _(进行中)_
- [x] **#5 Auth 路由守卫** — middleware.ts 保护 /profile /settings `1h` _(进行中)_

## 🟠 高优先级 (8 项)

- [ ] **#6 新页面 i18n** — Agents/Workflows/Analytics/Developers 硬编码中文提取到 i18n `2h`
- [ ] **#7 禁用按钮提示** — 修改密码/删除账户/编辑资料加 tooltip "即将推出" `1h`
- [ ] **#8 alert() 替换** — Launch/Workflows 的 alert() 换成 toast 通知组件 `2h`
- [ ] **#9 空功能按钮** — Agents 页运行/复刻按钮接入真实功能或跳转 `2h`
- [ ] **#10 通知系统打通** — 铃铛组件接真实 notifications API 数据 `2h`
- [ ] **#11 工作流保存** — "保存工作流"存入 Supabase 而非 alert `2h`
- [ ] **#12 Agent 系统真实化** — API 从数据库查询 agent 定义而非硬编码 `3h`
- [ ] **#13 测试套件** — battle-engine + agent-engine + workflow-engine 单元测试 `5h`

## 🟡 中等优先级 (8 项)

- [ ] **#14 新页面无障碍** — Developers/Analytics/Agents aria-label 补全 `2h`
- [ ] **#15 新页面移动端** — Developers 终端布局 + Analytics 表格溢出修复 `2h`
- [ ] **#16 AI API 错误日志** — 结构化错误响应 + 错误 ID + 详细日志 `1h`
- [ ] **#17 环境变量校验** — 启动时检查必需 env vars，清晰报错 `30min`
- [ ] **#18 数据库 schema 对齐** — follows/notifications 代码与表结构完全匹配 `2h`
- [ ] **#19 更多懒加载** — Analytics/Arena 重组件 dynamic import `1h`
- [ ] **#20 Profile 真实数据** — 统计数字从数据库查询而非硬编码 `2h`
- [ ] **#21 搜索接后端** — Explore/Ideas 搜索走 Supabase 全文搜索 `2h`

## 🟢 低优先级 (6 项)

- [ ] **#22 Terms/Privacy/About** — Footer 链接的法律页面 `1h`
- [ ] **#23 列表分页** — Creators/Events/Agents 分页加载 `2h`
- [ ] **#24 Battle 叙事流式化** — 战斗解说 API 改为流式输出 `1h`
- [ ] **#25 统一错误格式** — 所有 API 统一 `{ error, code, message }` 结构 `1h`
- [ ] **#26 Analytics 日期选择器** — 可选 7天/30天/90天 时间范围 `2h`
- [ ] **#27 Workflow 条件分支** — Builder 支持 if/else 分支节点 `4h`

## ⭐ 锦上添花 (4 项)

- [ ] **#28 多语言扩展** — 加日语/繁体中文/韩语 `3h`
- [ ] **#29 亮色主题** — Settings 主题切换功能实现 `4h`
- [ ] **#30 数据导出** — Analytics 导出 CSV/PDF 报告 `2h`
- [ ] **#31 OG 图片增强** — Agent/Workflow 页独立 OG 图生成 `2h`

---

## 功能模块完成度

| 模块 | 状态 | 真实/Mock | 备注 |
|------|------|-----------|------|
| 首页 Boot 序列 | ✅ 完成 | Mock | 动画完整 |
| Explore 浏览 | ✅ 完成 | Mock 数据 | 搜索仅前端 |
| Hunt 排行 | ✅ 完成 | Mock 数据 | — |
| Arena 战斗 | ✅ 完成 | 真实引擎 | AI 解说已接入 |
| Ideas 创意 | ✅ 完成 | AI 评估真实 | 提交存 DB |
| Creators 图鉴 | ✅ 完成 | Mock 数据 | — |
| Events 活动 | ⚠️ 部分 | Mock | 注册按钮禁用 |
| Insights 趋势 | ✅ 完成 | Mock 数据 | — |
| Launch 发布 | ✅ 完成 | AI 助手真实 | 表单存 DB |
| Login 登录 | ✅ 完成 | 真实 Supabase Auth | GitHub/Google/邮箱 |
| Profile 个人主页 | ⚠️ 部分 | Mock 统计 | 需接真实数据 |
| Settings 设置 | ⚠️ 部分 | 语言切换真实 | 密码/删除禁用 |
| Agent 市场 | ✅ 完成 | Mock agents | 运行按钮需接入 |
| Agent Builder | ✅ 完成 | 测试面板真实 | 发布是 mock |
| Agent 详情/运行 | ✅ 完成 | API 真实 | 需配置 API key |
| Workflows 工作流 | ⚠️ 部分 | Mock workflows | 保存是 alert |
| Analytics 分析 | ✅ 完成 | Mock 数据 | 全部硬编码 |
| Developers 开发者 | ✅ 完成 | Mock | API key 是假的 |
| 评论系统 | ✅ 完成 | Supabase 支持 | — |
| 关注系统 | ✅ 完成 | Supabase 支持 | — |
| 通知系统 | ⚠️ 部分 | API stub | 铃铛未接真实数据 |
| 全站搜索 | ✅ 完成 | 前端过滤 | Ctrl+K |

## API 端点清单

| 方法 | 路径 | 功能 | 验证 | 限流 |
|------|------|------|------|------|
| POST | /api/agents/run | 运行 Agent | ✅ | ❌ |
| POST | /api/agents/stream | 流式运行 Agent (SSE) | ✅ | ❌ |
| POST | /api/workflows/run | 运行工作流 | ✅ | ❌ |
| POST | /api/ai/review | AI 项目评审 | ✅ | ✅ |
| POST | /api/ai/evaluate-idea | AI 创意评估 | ✅ | ✅ |
| POST | /api/ai/battle-narrative | AI 战斗解说 | ✅ | ✅ |
| POST | /api/ai/launch-assist | AI 发布助手 (流式) | ✅ | ✅ |
| POST | /api/ai/share-summary | AI 分享文案 | ✅ | ❌ |
| POST | /api/ai/trend-analysis | AI 趋势分析 | ✅ | ❌ |
| POST | /api/projects/[id]/upvote | 项目点赞 | ❌ | ❌ |
| GET/POST | /api/comments | 评论 CRUD | ✅ | ✅ POST |
| POST | /api/follows | 关注/取关 | ❌ | ❌ |
| GET/POST | /api/notifications | 通知管理 | ❌ | ❌ |
| POST | /api/ideas | 提交创意 | ✅ | ❌ |
| POST | /api/battles | 保存战斗 | ✅ | ❌ |
| GET | /auth/callback | OAuth 回调 | — | — |

## 技术债务

- 零测试文件
- `mock-data.ts` 仍作为 re-export barrel 存在（可删除）
- `package-lock.json` 未 gitignore（设计如此）
- 部分 CSS 文件较大（nes-extracted.css 23KB）
- Framer Motion 未做 tree-shaking

---

## Git 提交历史

| # | Commit | 内容 |
|---|--------|------|
| 1 | `24644b3` | RPG 平台 + i18n |
| 2 | `47a8a1f` | i18n 收尾 + SEO |
| 3 | `87a9722` | Supabase 后端 |
| 4 | `54fb47b` | 用户认证 |
| 5 | `01adbb4` | UI/UX 打磨 |
| 6 | `d2e741b` | 6 个 AI 功能 |
| 7 | `34647a6` | 前端接入 AI |
| 8 | `c4c1cf5` | Share modal AI |
| 9 | `c983512` | 社交功能 |
| 10 | `04ef0cb` | 组件接线 |
| 11 | `5706eb7` | 移动端修复 |
| 12 | `11a538b` | 品牌改名 VibeX |
| 13 | `c2f2461` | 半开源结构 |
| 14 | `8e4a809` | 恢复构建文件 |
| 15 | `acd7bea` | Vercel 部署 |
| 16 | `0abab9d` | SQL 修复 |
| 17 | `9fe2802` | 性能/视觉/功能升级 |
| 18 | `057c92c` | Agent Marketplace |
| 19 | `c2a16e6` | Workflow 编排 |
| 20 | `32e64f9` | Analytics Dashboard |
| 21 | `34ea5ed` | Agent Builder |
| 22 | `c422405` | RPG 风格统一 |
| 23 | `21ad8ff` | API 开发者平台 |
| 24 | _进行中_ | 紧急安全修复 |
