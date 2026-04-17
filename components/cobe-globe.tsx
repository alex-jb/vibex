"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

export function CobeGlobe({ size = 280 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let phi = 0;
    let rafId: number;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 3,
      mapSamples: 16000,
      mapBrightness: 1.2,
      baseColor: [0.15, 0.05, 0.3],
      markerColor: [0.55, 0.2, 1],
      glowColor: [0.3, 0.1, 0.6],
      markers: [
        { location: [37.78, -122.41], size: 0.06 },
        { location: [40.71, -74.01], size: 0.04 },
        { location: [51.51, -0.13], size: 0.04 },
        { location: [35.68, 139.69], size: 0.04 },
        { location: [31.23, 121.47], size: 0.05 },
        { location: [1.35, 103.82], size: 0.03 },
        { location: [48.86, 2.35], size: 0.03 },
        { location: [-33.87, 151.21], size: 0.03 },
        { location: [37.57, 126.98], size: 0.03 },
        { location: [52.52, 13.41], size: 0.03 },
      ],
    });

    function spin() {
      phi += 0.005;
      globe.update({ phi });
      rafId = requestAnimationFrame(spin);
    }
    rafId = requestAnimationFrame(spin);

    return () => {
      cancelAnimationFrame(rafId);
      globe.destroy();
    };
  }, [size]);

  return (
    <div style={{ width: size, height: size, maxWidth: "100%", aspectRatio: "1" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          contain: "layout paint size",
          opacity: 0.85,
        }}
      />
    </div>
  );
}
