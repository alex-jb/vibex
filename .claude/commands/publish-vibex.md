# /publish-vibex — One-Click Publish to VibeX

You are a VibeX publishing assistant. Package the user's current project and submit it to the VibeX platform with auto-generated marketing copy.

## Steps

### 1. Scan Project
Read these files to understand the project (skip any that don't exist):
- `package.json` — name, description, version, homepage
- `README.md` — project overview
- Key entry point files (check `app/page.tsx`, `src/index.ts`, `src/main.ts`, `main.py`, `index.html`)

### 2. Auto-Generate Project Metadata
Based on the scan, generate:

- **title**: A catchy, concise project name (max 50 chars)
- **tagline**: A compelling one-liner hook (max 100 chars)
- **description**: A detailed description covering what it does, why it matters, and how it works (200-500 chars)
- **category**: Best fit from: `AI Agent`, `AI Tool`, `AI Game`, `AI Workflow`, `AI Utility`, `Experimental`, `Demo`
- **tags**: 3-5 relevant tags (comma-separated)
- **demoType**: `chat`, `sandbox`, `preview`, or `embedded`
- **creatorName**: From git config user.name or package.json author

### 3. Present for Confirmation
Show the generated metadata to the user in a formatted preview:

```
╔══════════════════════════════════════════════════════╗
║  VibeX PUBLISH PREVIEW                              ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  Title:    {title}                                   ║
║  Tagline:  {tagline}                                 ║
║  Category: {category}                                ║
║  Tags:     {tags}                                    ║
║  Demo:     {demoType}                                ║
║  Creator:  {creatorName}                             ║
║                                                      ║
║  Description:                                        ║
║  {description}                                       ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
```

Ask: "Ready to publish? (y/n/edit)"
- **y**: Proceed to submit
- **n**: Cancel
- **edit**: Let user modify specific fields

### 4. Submit to VibeX
Make a POST request to the VibeX API:

```bash
curl -X POST http://localhost:3000/api/projects/submit \
  -H "Content-Type: application/json" \
  -d '{
    "title": "{title}",
    "tagline": "{tagline}",
    "description": "{description}",
    "category": "{category}",
    "tags": ["{tag1}", "{tag2}"],
    "creatorName": "{creatorName}",
    "demoType": "{demoType}"
  }'
```

Use the Bash tool to make this curl request.

### 5. Show Success
On successful submission, display:

```
╔══════════════════════════════════════════════════════╗
║  ✓ PUBLISHED TO VibeX!                              ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  Project ID:  {id}                                   ║
║  URL:         https://vibex.app/project/{id}         ║
║  Score:       {compound score}/100                   ║
║                                                      ║
║  AI REVIEW SUMMARY                                   ║
║  Originality:  {score}/100                           ║
║  Clarity:      {score}/100                           ║
║  UX Potential: {score}/100                           ║
║  Virality:     {score}/100                           ║
║                                                      ║
║  > Your project is now live on VibeX!                ║
║  > Run /run-vibex for detailed analysis              ║
║  > Visit the launch page to generate a               ║
║    full marketing package.                           ║
╚══════════════════════════════════════════════════════╝
```

### 6. Error Handling
If the API returns an error:
- Show the error message clearly
- Suggest fixes (e.g., "Title too short", "Description needed")
- Offer to retry with corrected data
