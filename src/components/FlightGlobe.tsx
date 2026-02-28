import { useMemo } from "react";
import { geoInterpolate } from "d3-geo";
import { Map as MapIcon } from "lucide-react";
import { BaseGlobe } from "./BaseGlobe";

interface FlightGlobeProps {
  depLat: number;
  depLng: number;
  arrLat: number;
  arrLng: number;
}

export function FlightGlobe({ depLat, depLng, arrLat, arrLng }: FlightGlobeProps) {
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

  const hasMapCoords = !!(depLat && depLng && arrLat && arrLng);

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

  const pointOfView = {
    lat: (depLat + arrLat) / 2,
    lng: (depLng + arrLng) / 2,
    altitude: targetAltitude
  };

  return (
    <BaseGlobe
      pathsData={pathData}
      pointOfView={pointOfView}
    />
  );
}