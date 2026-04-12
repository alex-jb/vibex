declare module "@/lib/pretext" {
  export interface PreparedHandle {}
  export interface PreparedSegmentsHandle {}
  export interface LayoutResult {
    height: number;
    lineCount: number;
  }
  export function prepare(text: string, font: string): PreparedHandle;
  export function prepareWithSegments(text: string, font: string): PreparedSegmentsHandle;
  export function layout(
    prepared: PreparedHandle,
    maxWidth: number,
    lineHeight: number
  ): LayoutResult;
  export function clearCache(): void;
  export function setLocale(locale?: string): void;
}
