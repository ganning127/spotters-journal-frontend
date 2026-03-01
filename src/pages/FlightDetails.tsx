import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/api/axios";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlightGlobe } from "@/components/FlightGlobe";
import { AircraftInfo } from "@/components/AircraftInfo";
import { FlightInfoCards } from "@/components/FlightInfoCards";
import type { Photo } from "@/types";
import { parseLocalDate } from "@/lib/utils";
import { AirlineLogo } from "@/components/AirlineLogo";

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
                <AirlineLogo
                  domain={flight.airline?.domain}
                  className="h-12 w-12"
                />
                {flight.airline?.name || flight.airline_code} {flight.flight_number}
              </h1>
              <p className="text-muted-foreground mt-2 text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {parseLocalDate(flight.date).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FlightInfoCards flight={flight} />

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

      {/* Aircraft Information Section */}
      <AircraftInfo registrationHistory={rh} photos={photos} />

      <div className="flex justify-center pt-8">
        <p className="text-[10px] text-muted-foreground">
          Airline logos provided by <a href="https://logos.apistemic.com/" className="hover:underline" target="_blank" rel="noopener noreferrer">Apistemic</a>
        </p>
      </div>
    </div>
  );
}
