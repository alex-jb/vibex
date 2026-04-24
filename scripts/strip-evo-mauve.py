#!/usr/bin/env python3
"""Strip the opaque mauve background from public/generated/evo-*.png sprites.

Context: the evo sprites were generated via gpt-image-1.5 which baked an
opaque dark-mauve background into every PNG (sampled 2026-04-23 via PIL
edge pixels: rgba ≈ (67–72, 40–46, 70–94, 255)). When rendered on any
non-mauve surface (Game Boy black bezel on /profile V2, forge-orange
floor on /arena V2, anywhere on the forge landing) the surrounding mauve
rectangle bleeds purple — a forbidden brand color per AGENTS.md.

Fix: flood-fill from every edge pixel. Any pixel reachable from an edge
whose color is within tolerance of the sampled edge color becomes fully
transparent. Flood-fill (not blanket color replacement) preserves
mauve-toned pixels inside the sprite itself (e.g. a violet eye or a
shadow tint), since the sprite character doesn't touch the image edge.

In-place replacement. Git is the backup — `git checkout` on any file
reverts. Keep scripts/ documented so we can re-run after any future
sprite regeneration.

Usage:
    python3 scripts/strip-evo-mauve.py
"""

from pathlib import Path
from collections import deque

try:
    from PIL import Image
except ImportError:
    raise SystemExit("PIL not available. `pip install Pillow` or use a venv.")


REPO = Path(__file__).resolve().parent.parent
SPRITE_DIR = REPO / "public" / "generated"
SPRITES = sorted(SPRITE_DIR.glob("evo-*.png"))

# Channel-wise tolerance around the sampled edge color. 35 is tight enough
# to preserve in-sprite purples (which differ by >40 in at least one
# channel) and loose enough to catch JPEG-style dithering halos along the
# sprite silhouette.
TOLERANCE = 35


def sample_edge_color(im: "Image.Image") -> tuple[int, int, int]:
    """Take the median of 8 edge samples as the background reference."""
    w, h = im.size
    pts = [
        (0, 0), (w // 2, 0), (w - 1, 0),
        (0, h // 2),          (w - 1, h // 2),
        (0, h - 1), (w // 2, h - 1), (w - 1, h - 1),
    ]
    rs, gs, bs = [], [], []
    px = im.load()
    for x, y in pts:
        r, g, b, _ = px[x, y]
        rs.append(r); gs.append(g); bs.append(b)
    # sorted median — avoids the mean getting pulled by any single outlier
    rs.sort(); gs.sort(); bs.sort()
    mid = len(rs) // 2
    return rs[mid], gs[mid], bs[mid]


def strip(path: Path) -> tuple[int, int, int]:
    """Process one PNG in-place. Returns (before_mauve_edges, after_mauve_edges, changed_px)."""
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()

    br, bg, bb = sample_edge_color(im)

    def is_bg(p):
        r, g, b, a = p
        if a == 0:
            return False
        return (abs(r - br) <= TOLERANCE
                and abs(g - bg) <= TOLERANCE
                and abs(b - bb) <= TOLERANCE)

    # Seed queue with every edge pixel
    visited = [[False] * h for _ in range(w)]
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            q.append((x, y)); visited[x][y] = True
    for y in range(h):
        for x in (0, w - 1):
            if not visited[x][y]:
                q.append((x, y)); visited[x][y] = True

    changed = 0
    while q:
        x, y = q.popleft()
        p = px[x, y]
        if is_bg(p):
            px[x, y] = (0, 0, 0, 0)
            changed += 1
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                    visited[nx][ny] = True
                    q.append((nx, ny))

    # Edge-count before/after for reporting
    before_edge_mauve = sum(
        1 for (x, y) in [
            (0, 0), (w // 2, 0), (w - 1, 0),
            (0, h // 2), (w - 1, h // 2),
            (0, h - 1), (w // 2, h - 1), (w - 1, h - 1),
        ]
        if is_bg((br, bg, bb, 255))  # tautologically 1 before
    )  # unused — for symmetry
    del before_edge_mauve

    # Re-sample edges after processing
    now_edge_transparent = 0
    for (x, y) in [
        (0, 0), (w // 2, 0), (w - 1, 0),
        (0, h // 2), (w - 1, h // 2),
        (0, h - 1), (w // 2, h - 1), (w - 1, h - 1),
    ]:
        if px[x, y][3] == 0:
            now_edge_transparent += 1

    im.save(path, optimize=True)
    return 8, now_edge_transparent, changed


def main() -> int:
    if not SPRITES:
        print(f"No evo-*.png in {SPRITE_DIR}")
        return 1
    for sprite in SPRITES:
        total, transparent_after, changed = strip(sprite)
        relpath = sprite.relative_to(REPO)
        print(f"  {relpath}: {changed:>6} px → transparent "
              f"(edges {transparent_after}/{total} now clear)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
