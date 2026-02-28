import { useEffect, useState, useRef, useMemo } from "react";
import Globe from "react-globe.gl";
import { Map as MapIcon } from "lucide-react";
import { geoInterpolate } from "d3-geo";

interface FlightGlobeProps {
  depLat: number;
  depLng: number;
  arrLat: number;
  arrLng: number;
}

export function FlightGlobe({ depLat, depLng, arrLat, arrLng }: FlightGlobeProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });

  // 1. Memoize coordinates to prevent unnecessary re-renders of the Globe
  const pathData = useMemo(() => {
    const interpolate = geoInterpolate([depLng, depLat], [arrLng, arrLat]);
    const numPoints = 100;
    const points = Array.from({ length: numPoints }, (_, i) => {
      const t = i / (numPoints - 1); // current "progress"
      const [lng, lat] = interpolate(t);
      return [lat, lng]; // react-globe.gl path expects [lat, lng]
    });

    return [{
      points,
      color: ['#3b82f6', '#22c55e']
    }];
  }, [depLat, depLng, arrLat, arrLng]);

  const hasMapCoords = depLat && depLng && arrLat && arrLng;

  useEffect(() => {
    if (!hasMapCoords || !containerRef.current) return;

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
  }, [hasMapCoords]);

  if (!hasMapCoords) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 text-muted-foreground">
        <MapIcon className="h-12 w-12 mb-4 opacity-20" />
        <p>Map coordinates unavailable for this route.</p>
      </div>
    );
  }

  // Calculate target altitude once
  const latDiff = Math.abs(depLat - arrLat);
  const lngDiff = Math.abs(depLng - arrLng);
  const maxDiff = Math.max(latDiff, lngDiff);
  let targetAltitude = 1.5;
  if (maxDiff < 5) targetAltitude = 0.3;
  else if (maxDiff < 30) targetAltitude = 0.8;

  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height > 400 ? dimensions.height : 400}
          globeTileEngineUrl={(x, y, l) =>
            `https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${l}`
          }
          backgroundColor="rgba(0,0,0,0)"

          pathsData={pathData}
          pathPoints="points"
          pathPointLat={p => p[0]}
          pathPointLng={p => p[1]}
          pathColor="color"
          pathDashLength={0.5}
          pathDashGap={0.01}
          pathDashAnimateTime={2000}
          pathStroke={1.5}

          onGlobeReady={() => {
            if (globeRef.current) {
              globeRef.current.pointOfView({
                lat: (depLat + arrLat) / 2,
                lng: (depLng + arrLng) / 2,
                altitude: targetAltitude
              }, 1000); // 1s transition for smoothness

              const controls = globeRef.current.controls();
              controls.enableZoom = true;
            }
          }}
        />
      )}
    </div>
  );
}