import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/api/axios";
import { ArrowLeft, Plane, Calendar, Route, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlightGlobe } from "@/components/FlightGlobe";
import { PhotoCard } from "@/components/PhotoCard";
import type { Photo } from "@/types";
import { parseLocalDate } from "@/lib/utils";

export default function FlightDetails() {
  const { id } = useParams();
  const [flight, setFlight] = useState<any>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);


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
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm col-span-1 md:col-span-2 min-h-[400px] relative">
          <FlightGlobe
            depLat={depLat}
            depLng={depLng}
            arrLat={arrLat}
            arrLng={arrLng}
          />
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
            <Link to={`/upload`}>
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
