declare module "@/lib/pretext" {
  // Opaque handle types — the engine returns private objects that we
  // only ever pass back in. Branded so TS can't confuse them with each
  // other or with plain objects, without tripping no-empty-object-type.
  export type PreparedHandle = { readonly __brand: "PreparedHandle" };
  export type PreparedSegmentsHandle = {
    readonly __brand: "PreparedSegmentsHandle";
  };
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
