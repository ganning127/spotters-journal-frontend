import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/api/axios";
import { ArrowLeft, Plane, Map as MapIcon, Calendar, Route, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import Globe from "react-globe.gl";
import { useRef } from "react";
import * as THREE from "three";
import { PhotoCard } from "@/components/PhotoCard";
import type { Photo } from "@/types";
import { parseLocalDate } from "@/lib/utils";

export default function FlightDetails() {
  const { id } = useParams();
  const [flight, setFlight] = useState<any>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
  const [altitude, setAltitude] = useState(1.5);

  useEffect(() => {
    if (loading || !flight || !containerRef.current) return;
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
  }, [loading, flight]);

  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        setLoading(true);
        // Fetch flight info
        const flightRes = await api.get(`/flights/${id}`);
        setFlight(flightRes.data);

        // Fetch related photos
        const photosRes = await api.get(`/flights/${id}/photos`);
        setPhotos(photosRes.data);
      } catch (err) {
        console.error("Failed to load flight details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchFlightDetails();
  }, [id]);

  const depLat = flight?.dep?.latitude;
  const depLng = flight?.dep?.longitude;
  const arrLat = flight?.arr?.latitude;
  const arrLng = flight?.arr?.longitude;

  const hasMapCoords = depLat && depLng && arrLat && arrLng;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Flight not found.</p>
        <Link to="/flights">
          <Button variant="outline" className="mt-4">Back to Flights</Button>
        </Link>
      </div>
    );
  }

  const rh = flight.RegistrationHistory || {};
  const ac = rh.SpecificAircraft?.AircraftType || {};
  // Note: L.latLngBounds is not defined in the provided context.
  // If L is a global variable (e.g., Leaflet), it should be imported or declared.
  // For now, this line is commented out to avoid a reference error.
  // const bounds = hasMapCoords
  //   ? L.latLngBounds([[depLat, depLng], [arrLat, arrLng]]).pad(0.2)
  //   : undefined;


  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex items-start gap-4 border-b pb-6">
        <Link to="/flights">
          <Button variant="ghost" size="icon" className="rounded-full shrink-0">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <Plane className="h-8 w-8 text-primary" />
                {flight.airline?.name || flight.airline_code} {flight.flight_number}
              </h1>
              <p className="text-muted-foreground mt-2 text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {parseLocalDate(flight.date).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </p>
            </div>
            <div className="text-left sm:text-right bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Registration</p>
              <p className="text-xl font-mono font-bold text-primary">{rh.registration}</p>
              <p className="text-sm font-medium">{ac.manufacturer} {ac.type}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Route Info */}
        <div className="bg-card border rounded-xl p-6 shadow-sm col-span-1 md:col-span-1 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <span className="font-bold text-blue-600">DEP</span>
              </div>
              <div>
                <p className="font-semibold text-lg">{flight.dep?.name || "Unknown Airport"}</p>
                <p className="text-muted-foreground font-mono">{flight.dep_airport}</p>
              </div>
            </div>

            <div className="pl-5 border-l-2 border-dashed border-border ml-5 py-2">
              <div className="text-xs font-semibold text-muted-foreground flex items-center gap-2 bg-background px-2 py-1 inline-flex rounded-full border">
                <Route className="h-3 w-3" />
                {flight.distance} mi
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <span className="font-bold text-green-600">ARR</span>
              </div>
              <div>
                <p className="font-semibold text-lg">{flight.arr?.name || "Unknown Airport"}</p>
                <p className="text-muted-foreground font-mono">{flight.arr_airport}</p>
              </div>
            </div>
          </div>

          {flight.notes && (
            <div className="pt-4 border-t">
              <p className="text-sm text-foreground/80 italic">"{flight.notes}"</p>
            </div>
          )}
        </div>

        {/* Map */}
        <div ref={containerRef} className="bg-card border rounded-xl overflow-hidden shadow-sm col-span-1 md:col-span-2 min-h-[400px] relative">
          {!hasMapCoords ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 text-muted-foreground">
              <MapIcon className="h-12 w-12 mb-4 opacity-20" />
              <p>Map coordinates unavailable for this route.</p>
            </div>
          ) : (
            dimensions.width > 0 && (
              <div className="absolute inset-0 z-0">
                <Globe
                  ref={globeRef}
                  width={dimensions.width}
                  height={dimensions.height > 400 ? dimensions.height : 400}
                  globeTileEngineUrl={(x, y, l) => `https://a.tile.openstreetmap.org/${l}/${x}/${y}.png`}
                  showGlobe={true}
                  backgroundColor="rgba(0,0,0,0)"
                  arcsData={hasMapCoords ? [
                    {
                      startLat: depLat,
                      startLng: depLng,
                      endLat: arrLat,
                      endLng: arrLng,
                      color: ["#3b82f6", "#22c55e"] // Gradient from blue to green
                    }
                  ] : []}
                  arcColor="color"
                  arcAltitude={0.01} // Hug the surface
                  arcStroke={Math.max(0.2, altitude * 0.8)}
                  // Removing animation for a solid static line

                  // Adding custom layer for the arrow
                  customLayerData={hasMapCoords ? [{
                    lat: arrLat,
                    lng: arrLng,
                    startLat: depLat,
                    startLng: depLng
                  }] : []}
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
                  pointAltitude={0.05}
                  pointRadius={Math.max(0.05, altitude * 0.3)}
                  pointsMerge={false}
                  onGlobeReady={() => {
                    if (globeRef.current && hasMapCoords) {
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
              </div>
            )
          )}
        </div>
      </div>

      {/* Associated Photos */}
      <div className="pt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
          <Camera className="h-6 w-6 text-primary" />
          Your photos of {rh.registration}
        </h2>

        {photos.length === 0 ? (
          <div className="text-center py-12 bg-card border rounded-xl border-dashed">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground text-lg">You haven't uploaded any photos of this aircraft yet.</p>
            <Link to={`/upload?registration=${rh.registration}`}>
              <Button variant="outline" className="mt-4">Upload Photo</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map(photo => (
              <PhotoCard
                key={photo.id}
                photo={photo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
