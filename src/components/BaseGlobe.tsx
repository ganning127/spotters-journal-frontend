import { useEffect, useState, useRef } from "react";
import Globe from "react-globe.gl";

export interface BaseGlobeProps {
  pathsData: any[];
  pointOfView?: { lat: number; lng: number; altitude: number };
}

export function BaseGlobe({ pathsData, pointOfView }: BaseGlobeProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 bg-transparent">
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height > 400 ? dimensions.height : 400}
          globeTileEngineUrl={(x, y, l) =>
            `https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${l}`
          }
          backgroundColor="rgba(0,0,0,0)"

          pathsData={pathsData}
          pathPoints="points"
          pathPointLat={p => p[0]}
          pathPointLng={p => p[1]}
          pathColor="color"
          pathDashLength={0.5}
          pathDashGap={0.01}
          pathDashAnimateTime={2000}
          pathStroke={2.5}

          onGlobeReady={() => {
            if (globeRef.current) {
              if (pointOfView) {
                globeRef.current.pointOfView(pointOfView, 1000);
              }
              const controls = globeRef.current.controls();
              controls.enableZoom = true;
            }
          }}
        />
      )}
    </div>
  );
}
