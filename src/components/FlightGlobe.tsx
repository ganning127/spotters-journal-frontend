import { useEffect, useState, useRef, useMemo } from "react";
import Globe from "react-globe.gl";
import { Map as MapIcon } from "lucide-react";

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
  const arcData = useMemo(() => [{
    startLat: depLat,
    startLng: depLng,
    endLat: arrLat,
    endLng: arrLng,
    color: ['#3b82f6', '#22c55e']
  }], [depLat, depLng, arrLat, arrLng]);

  const pointsData = useMemo(() => [
    { lat: depLat, lng: depLng, color: "#3b82f6" },
    { lat: arrLat, lng: arrLng, color: "#22c55e" }
  ], [depLat, depLng, arrLat, arrLng]);

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

          // Use Arcs instead of Paths for better stability and "Great Circle" curves
          arcsData={arcData}
          arcColor="color"
          arcDashLength={0.5}
          arcDashGap={0.01}
          arcDashAnimateTime={2000}
          arcStroke={0.5}

          pointsData={pointsData}
          pointColor="color"
          pointRadius={0.2}
          pointAltitude={0}

          onGlobeReady={() => {
            if (globeRef.current) {
              globeRef.current.pointOfView({
                lat: (depLat + arrLat) / 2,
                lng: (depLng + arrLng) / 2,
                altitude: targetAltitude
              }, 1000); // 1s transition for smoothness

              const controls = globeRef.current.controls();
              controls.enableZoom = true;
              // Note: We removed the 'change' event listener that was 
              // triggering setAltitude to prevent the re-render loop.
            }
          }}
        />
      )}
    </div>
  );
}