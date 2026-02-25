import { useEffect, useState, useRef } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";
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
  const [altitude, setAltitude] = useState(1.5);

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

  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height > 400 ? dimensions.height : 400}
          globeTileEngineUrl={(x, y, l) =>
            `https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${l}`
          } showGlobe={true}
          backgroundColor="rgba(0,0,0,0)"
          arcsData={[
            {
              startLat: depLat,
              startLng: depLng,
              endLat: arrLat,
              endLng: arrLng,
              color: ["#3b82f6", "#22c55e"] // Gradient from blue to green
            }
          ]}
          arcColor="color"
          arcAltitude={0.01} // Hug the surface
          arcStroke={Math.max(0.2, altitude * 0.8)}

          // Adding custom layer for the arrow
          customLayerData={[{
            lat: arrLat,
            lng: arrLng,
            startLat: depLat,
            startLng: depLng
          }]}
          customThreeObject={(d: any) => {
            const getCoords = (lat: number, lng: number) => {
              const GLOBE_RADIUS = 100;
              const phi = (90 - lat) * (Math.PI / 180);
              const theta = (lng + 180) * (Math.PI / 180);
              return new THREE.Vector3(
                -(GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta)),
                GLOBE_RADIUS * Math.cos(phi),
                GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta)
              );
            };

            const start = getCoords(d.startLat, d.startLng);
            const end = getCoords(d.lat, d.lng);

            // Direction vector
            const dir = end.clone().sub(start).normalize();

            // Create an ArrowHelper slightly raised
            const arrow = new THREE.ArrowHelper(
              dir,
              start.clone().add(dir.clone().multiplyScalar(start.distanceTo(end) * 0.5)),
              Math.max(1, altitude * 6), // length
              0x22c55e, // green color for arrow
              Math.max(0.3, altitude * 2), // head length
              Math.max(0.2, altitude * 1.5) // head width
            );

            // Offset altitude so it sits above the map
            arrow.position.multiplyScalar(1.01);
            return arrow;
          }}
          pointsData={[
            { lat: depLat, lng: depLng, color: "#3b82f6" }, // blue-500
            { lat: arrLat, lng: arrLng, color: "#22c55e" }  // green-500
          ]}
          pointColor="color"
          pointAltitude={0} // Changed from 0.05 to 0 for dots
          pointRadius={Math.max(0.12, altitude * 0.4)} // Slightly larger dots
          pointsMerge={false}
          onGlobeReady={() => {
            if (globeRef.current) {
              // Calculate altitude
              const latDiff = Math.abs(depLat - arrLat);
              const lngDiff = Math.abs(depLng - arrLng);
              const maxDiff = Math.max(latDiff, lngDiff);

              let targetAltitude = 1.5;
              if (maxDiff < 5) targetAltitude = 0.2;
              else if (maxDiff < 15) targetAltitude = 0.4;
              else if (maxDiff < 30) targetAltitude = 0.8;
              else if (maxDiff < 60) targetAltitude = 1.2;

              setAltitude(targetAltitude);

              // Set point of view instantly
              globeRef.current.pointOfView({
                lat: (depLat + arrLat) / 2,
                lng: (depLng + arrLng) / 2,
                altitude: targetAltitude
              }, 0);

              // Enable scroll zoom and set limits
              const controls = globeRef.current.controls();
              controls.enableZoom = true;
              controls.minDistance = 100; // Allow zooming in closer
              controls.maxDistance = 400; // Limit zoom out

              // Dynamically adjust scale on scroll
              controls.addEventListener('change', () => {
                if (globeRef.current) {
                  setAltitude(globeRef.current.pointOfView().altitude);
                }
              });
            }
          }}
        />
      )}
    </div>
  );
}
