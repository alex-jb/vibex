# vibex-publish-mcp — submit-from-Claude MCP server (v0.1 spec)

**Status:** specced 2026-05-13, **not yet implemented**.
**Target ship:** post-launch, next sprint after v1 stabilizes.
**Trigger:** Anthropic 2026-04-28 Claude→Blender/Adobe/Canva/etc connectors. Same pattern, different layer — instead of designers chatting with Claude inside Photoshop, we let AI creators chat with Claude inside their dev terminal and submit projects to VibeXForge.

## Why this is the right wave to ride

VibeXForge's friction today:
> creator builds AI app → opens vibexforge.com → fills `/launch` form → 30 seconds.

VibeXForge's friction with MCP server:
> creator builds AI app → `claude "submit my new project to vibex"` → Claude calls `vibex_submit` tool with URL + auto-detected metadata → drafts auto-render → review in `~/.marketing_agent/queue/pending/`.

The 30 seconds becomes 0 seconds. AND the user never leaves their dev environment.

This rhymes with `vibex-publish-agent v0.1` (already scaffolded per memory) but pushes the entry point further left.

## API surface (v0.1, 4 tools)

```python
@tool(name="vibex_submit")
def vibex_submit(
    url: str,
    title: str | None = None,
    tagline: str | None = None,
    category: str | None = None,
) -> dict:
    """Submit an AI project to VibeXForge for distribution amplification.

    If url is a GitHub repo, scrapes README for missing fields. If url
    is a hosted demo, requires title + tagline.

    Returns: {project_id, url_on_vibex, drafts_queued: int}
    """

@tool(name="vibex_get_drafts")
def vibex_get_drafts(project_id: str) -> dict:
    """Return the 24 platform drafts auto-generated post-submit.

    Returns: {"drafts": [{platform, variant, body, char_count, status}, ...]}
    """

@tool(name="vibex_re_roll_draft")
def vibex_re_roll_draft(draft_id: str) -> dict:
    """Regenerate a specific draft (different variant or improved prompt)."""

@tool(name="vibex_search_amplified")
def vibex_search_amplified(query: str, limit: int = 5) -> dict:
    """Search recently amplified projects (read-only, public data)."""
```

## Stack

```
vibex-mcp/
├── pyproject.toml         # name: vibex-publish-mcp
├── src/vibex_mcp/
│   ├── __init__.py
│   ├── server.py          # MCP entry point (stdio)
│   ├── tools/
│   │   ├── submit.py      # → POST /api/projects/submit
│   │   ├── drafts.py      # → GET /api/projects/[id]/drafts
│   │   ├── reroll.py      # → POST /api/drafts/[id]/reroll
│   │   └── search.py      # → GET /api/projects (filtered)
│   └── auth.py            # token from $VIBEX_API_KEY
├── tests/
└── README.md
```

**Reuse:** existing VibeXForge API endpoints. No new server code. The MCP server is a thin shim that forwards stdio→HTTPS.

## Auth model

Per-creator token. Generated via:
- `https://vibexforge.com/settings/api-keys` (new UI surface, 10 LOC)
- Token scoped to `creator_id` so all writes are attributed
- Rate-limit per token (10 submits/day default, configurable)

This is **higher trust** than the niànniàn MCP server — vibex tokens write to a public database. Token must be revocable from the UI.

## Distribution

```bash
pip install vibex-publish-mcp
```

Claude Desktop config:
```json
{
  "mcpServers": {
    "vibex": {
      "command": "vibex-mcp",
      "env": {
        "VIBEX_API_KEY": "vbx_..."
      }
    }
  }
}
```

## What this unlocks

1. **`autoplan` workflow integration** — when Alex's CEO plan auto-generates a "we should ship X", marketing-agent can `vibex_submit` the resulting demo straight to vibexforge.com without a manual form.
2. **Cross-tool: niànniàn → vibex** — if niànniàn ships its MCP server (see `2026-05-13-niannian-mcp-server.md`), there's a path where Claude Desktop user creates a 念念 scene + submits it as a "creative project" to VibeXForge in one chain.
3. **Awesome-claude listings** — the package becomes a citable entry in awesome-mcp-servers lists, giving VibeXForge free top-of-funnel exposure to the indie Claude dev community.

## Open questions

- **Multi-creator session:** can one VIBEX_API_KEY support multiple creator profiles? Or strict 1-key-1-creator?
- **Image upload via MCP:** how do users attach a project thumbnail through MCP? Base64 in the call vs second-step URL flow.
- **vibex-publish-agent overlap:** `vibex-publish-agent` (the OSS agent in SFOS) targets *internal* publishing workflows. `vibex-publish-mcp` (this spec) targets *external* user-initiated submission. Naming may conflict — consider renaming one to disambiguate before either ships.

## Ship sequence

1. **Wait** for v1 launch stability + first 50 real creators
2. **Auth UI** add `/settings/api-keys` (1 day)
3. **MCP scaffold** repo + 4 tools (2 days)
4. **PyPI release** via Trusted Publisher (1 hr)
5. **Launch post** via `render_wave_borrow_post` — "Anthropic shipped Claude→Adobe. We shipped Claude→VibeXForge."

Estimated 3-4 dev days post-traction baseline. Defer until then.
