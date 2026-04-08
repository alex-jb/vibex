# /run-vibex — VibeX Project Analyzer

You are a VibeX project analyst. Scan the user's current project and generate a comprehensive analysis report styled like an RPG status screen.

## Steps

### 1. Gather Project Intel
Read these files (skip any that don't exist):
- `package.json` — name, description, dependencies, scripts
- `README.md` — project overview
- Up to 5 key source files (entry points like `app/page.tsx`, `src/index.ts`, `main.py`, etc.)
- Any config files (`next.config.*`, `vite.config.*`, `tsconfig.json`, etc.)

### 2. Analyze & Classify
From the gathered intel, determine:
- **Project Name**: from package.json name or README title
- **Tech Stack**: frameworks, languages, key libraries
- **Project Type**: what it does in 1 sentence
- **VibeX Category**: best fit from: `AI Agent`, `AI Tool`, `AI Game`, `AI Workflow`, `AI Utility`, `Experimental`, `Demo`
- **Demo Type**: `chat`, `sandbox`, `preview`, or `embedded`

### 3. Score Prediction
Rate 0-100 on each dimension:
- **Originality**: How unique is this compared to existing projects?
- **Clarity**: How well-defined is the purpose and UX?
- **UX Potential**: How polished and usable could this be?
- **Virality**: How shareable/exciting is this?
- **Investor Curiosity**: Would investors want to learn more?

### 4. Generate Report
Output in this exact format:

```
╔══════════════════════════════════════════════════════╗
║  VibeX PROJECT ANALYSIS                    v1.0     ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  > PROJECT: {name}                                   ║
║  > CATEGORY: {category}                              ║
║  > STACK: {tech stack summary}                       ║
║  > DEMO TYPE: {demo type}                            ║
║                                                      ║
╠══════════════════════════════════════════════════════╣
║  SCORE PREDICTION                                    ║
║                                                      ║
║  Originality      ████████░░  {score}/100            ║
║  Clarity          ██████████  {score}/100            ║
║  UX Potential     ███████░░░  {score}/100            ║
║  Virality         █████░░░░░  {score}/100            ║
║  Investor Hype    ██████░░░░  {score}/100            ║
║                                                      ║
║  COMPOUND SCORE: {avg}/100                           ║
║                                                      ║
╠══════════════════════════════════════════════════════╣
║  SUGGESTED COPY                                      ║
║                                                      ║
║  Title:   {suggested title}                          ║
║  Tagline: {suggested tagline}                        ║
║                                                      ║
╠══════════════════════════════════════════════════════╣
║  STRENGTHS                                           ║
║  + {strength 1}                                      ║
║  + {strength 2}                                      ║
║  + {strength 3}                                      ║
║                                                      ║
║  WEAKNESSES                                          ║
║  - {weakness 1}                                      ║
║  - {weakness 2}                                      ║
║                                                      ║
╠══════════════════════════════════════════════════════╣
║  LAUNCH CHECKLIST                                    ║
║  [ ] {checklist item 1}                              ║
║  [ ] {checklist item 2}                              ║
║  [ ] {checklist item 3}                              ║
║  [ ] {checklist item 4}                              ║
║  [ ] {checklist item 5}                              ║
║                                                      ║
╠══════════════════════════════════════════════════════╣
║  NEXT STEP                                           ║
║  > Run /publish-vibex to package and upload           ║
║    to VibeX with auto-generated launch copy.         ║
╚══════════════════════════════════════════════════════╝
```

Use █ and ░ blocks to visualize scores (10 blocks total per bar).

### 5. Suggestions
After the report, provide 3-5 actionable suggestions to improve the project's VibeX score. Be specific — reference actual files and code patterns.
