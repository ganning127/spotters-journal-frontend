import { useEffect, useState } from "react";
import api from "../api/axios";
import { Plane, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FlightTable } from "@/components/FlightTable";
import type { UserFlight as Flight } from "@/types";
import { MultiFlightGlobe } from "@/components/MultiFlightGlobe";

export default function MyFlights() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const res = await api.get("/flights");
      setFlights(res.data);
    } catch (err) {
      console.error("Failed to fetch flights", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const flightCoords = flights
    .filter(f => typeof f.dep?.latitude === 'number' && typeof f.dep?.longitude === 'number' && typeof f.arr?.latitude === 'number' && typeof f.arr?.longitude === 'number')
    .map(f => ({
      depLat: f.dep!.latitude as number,
      depLng: f.dep!.longitude as number,
      arrLat: f.arr!.latitude as number,
      arrLng: f.arr!.longitude as number,
      depIcao: f.dep_airport,
      arrIcao: f.arr_airport,
    }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Plane className="h-8 w-8 text-primary" />
            My Flights
          </h1>
          <p className="text-muted-foreground mt-1">
            You have logged {flights.length} {flights.length === 1 ? 'flight' : 'flights'}.
          </p>
        </div>
        <Link to="/flights/add">
          <Button className="gap-2 shadow-sm transition-all hover:scale-105">
            <Plus size={18} />
            Log a Flight
          </Button>
        </Link>
      </div>

      {!loading && flights.length > 0 && (
        <div className="w-full h-[600px] relative rounded-xl overflow-hidden border bg-background shadow-sm">
          <MultiFlightGlobe flights={flightCoords} />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 animate-pulse">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading flight log...</p>
        </div>
      ) : flights.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-xl border border-dashed">
          <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No flights logged yet</h3>
          <p className="text-muted-foreground mt-1">
            Start tracking your travels by adding a new flight.
          </p>
          <Link to="/flights/add">
            <Button variant="outline" className="mt-6 gap-2">
              Log Your First Flight
            </Button>
          </Link>
        </div>
      ) : (
        <FlightTable flights={flights} onRefresh={fetchFlights} />
      )}

      <div className="flex justify-center pt-8">
        <p className="text-[10px] text-muted-foreground">
          Airline logos provided by <a href="https://logos.apistemic.com/" className="hover:underline" target="_blank" rel="noopener noreferrer">Apistemic</a>
        </p>
      </div>
    </div>
  );
}
