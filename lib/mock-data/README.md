# Mock Data

The individual data files (projects.ts, creators.ts, etc.) are not included in the public repository.

To run VibeX locally, create your own data files following the TypeScript interfaces in `lib/types.ts`.

Each file should export an array matching the corresponding type:

- `projects.ts` → `export const rawProjects: Project[]`
- `creators.ts` → `export const rawCreators: Creator[]`
- `ideas.ts` → `export const ideas: Idea[]`
- `events.ts` → `export const events: Event[]`
- `trends.ts` → `export const trendInsights: TrendInsight[]`
- `winners.ts` → `export const weeklyWinners: WeeklyWinner[]`

See `lib/types.ts` for all interface definitions.
