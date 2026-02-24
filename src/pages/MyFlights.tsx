import { useEffect, useState } from "react";
import api from "../api/axios";
import { Plane, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { FlightCard } from "@/components/FlightCard";
import type { Flight } from "@/components/FlightCard";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {flights.map((flight) => (
            <FlightCard key={flight.uuid_flight} flight={flight} onRefresh={fetchFlights} />
          ))}
        </div>
      )}
    </div>
  );
}
