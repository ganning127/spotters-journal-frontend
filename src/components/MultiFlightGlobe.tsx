import { useMemo } from "react";
import { geoInterpolate } from "d3-geo";
import { BaseGlobe } from "./BaseGlobe";
import { Map as MapIcon } from "lucide-react";

interface FlightCoords {
  depLat: number;
  depLng: number;
  arrLat: number;
  arrLng: number;
  depIcao: string;
  arrIcao: string;
}

interface MultiFlightGlobeProps {
  flights: FlightCoords[];
}

export function MultiFlightGlobe({ flights }: MultiFlightGlobeProps) {
  const pathsData = useMemo(() => {
    const routeCounts: Record<string, number> = {};
    const uniqueRoutesMap = new Map<string, FlightCoords>();

    flights.forEach(f => {
      if (!f.depIcao || !f.arrIcao) return;
      const routeKey = [f.depIcao, f.arrIcao].sort().join('-');
      routeCounts[routeKey] = (routeCounts[routeKey] || 0) + 1;
      if (!uniqueRoutesMap.has(routeKey)) {
        uniqueRoutesMap.set(routeKey, f);
      }
    });

    const getColorForFrequency = (freq: number) => {
      if (freq >= 10) return ['#ef4444', '#7f1d1d']; // Red
      if (freq >= 5) return ['#f97316', '#9a3412']; // Orange
      if (freq >= 3) return ['#eab308', '#854d0e']; // Yellow
      if (freq >= 2) return ['#8b5cf6', '#4c1d95']; // Purple
      return ['#3b82f6', '#1d4ed8']; // Blue (1 flight)
    };

    return Array.from(uniqueRoutesMap.entries()).map(([routeKey, flight]) => {
      const interpolate = geoInterpolate(
        [flight.depLng, flight.depLat],
        [flight.arrLng, flight.arrLat]
      );
      const numPoints = 100;
      const points = Array.from({ length: numPoints }, (_, i) => {
        const t = i / (numPoints - 1);
        const [lng, lat] = interpolate(t);
        return [lat, lng];
      });

      const freq = routeCounts[routeKey];

      return {
        points,
        color: getColorForFrequency(freq)
      };
    });
  }, [flights]);

  const pointOfView = useMemo(() => {
    if (flights.length === 0) return { lat: 0, lng: 0, altitude: 2.5 };

    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    flights.forEach(f => {
      minLat = Math.min(minLat, f.depLat, f.arrLat);
      maxLat = Math.max(maxLat, f.depLat, f.arrLat);
      minLng = Math.min(minLng, f.depLng, f.arrLng);
      maxLng = Math.max(maxLng, f.depLng, f.arrLng);
    });

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    let targetAltitude = 2.5;
    if (maxDiff < 20) targetAltitude = 1.0;
    else if (maxDiff < 60) targetAltitude = 1.8;
    else if (maxDiff > 120) targetAltitude = 2.5;

    return { lat: centerLat, lng: centerLng, altitude: targetAltitude };
  }, [flights]);

  if (flights.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 text-muted-foreground rounded-xl border border-dashed text-sm">
        <MapIcon className="h-8 w-8 mb-2 opacity-20" />
        <p>No valid flights to display.</p>
      </div>
    );
  }

  return (
    <BaseGlobe
      pathsData={pathsData}
      pointOfView={pointOfView}
    />
  );
}
