import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { Plane, Plus, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FlightTable } from "@/components/FlightTable";
import type { UserFlight as Flight } from "@/types";
import { MultiFlightGlobe } from "@/components/MultiFlightGlobe";
import { cn } from "@/lib/utils";

export default function MyFlights() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

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

  const yearsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    flights.forEach((f) => {
      let year = "Unknown";
      if (f.date) {
        year = f.date.substring(0, 4);
      } else if (f.dep_ts) {
        year = new Date(f.dep_ts).getFullYear().toString();
      }
      counts[year] = (counts[year] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year.localeCompare(a.year));
  }, [flights]);

  const filteredFlights = useMemo(() => {
    if (selectedYears.length === 0) return flights;
    return flights.filter((f) => {
      let year = "Unknown";
      if (f.date) {
        year = f.date.substring(0, 4);
      } else if (f.dep_ts) {
        year = new Date(f.dep_ts).getFullYear().toString();
      }
      return selectedYears.includes(year);
    });
  }, [flights, selectedYears]);

  const flightCoords = filteredFlights
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
            You have logged {filteredFlights.length} {filteredFlights.length === 1 ? 'flight' : 'flights'}.
          </p>
        </div>
        <Link to="/flights/add">
          <Button className="gap-2 shadow-sm transition-all hover:scale-105">
            <Plus size={18} />
            Log a Flight
          </Button>
        </Link>
      </div>

      {yearsWithCounts.length > 1 && (
        <div className="bg-card border rounded-xl p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Filter size={12} />
              <span>Filter by Year</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {yearsWithCounts.map(({ year, count }) => {
                const isSelected = selectedYears.includes(year);
                return (
                  <button
                    key={year}
                    onClick={() =>
                      setSelectedYears((prev) => {
                        if (prev.includes(year)) {
                          return prev.filter((y) => y !== year);
                        }
                        return [...prev, year];
                      })
                    }
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:bg-muted"
                    )}
                  >
                    {year}
                    <span className={cn("ml-0.5 opacity-60", isSelected ? "text-primary-foreground" : "")}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!loading && filteredFlights.length > 0 && (
        <div className="w-full h-[500px] relative rounded-xl overflow-hidden border bg-background shadow-sm">
          <MultiFlightGlobe flights={flightCoords} />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 animate-pulse">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading flight log...</p>
        </div>
      ) : filteredFlights.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-xl border border-dashed">
          <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No flights found</h3>
          <p className="text-muted-foreground mt-1">
            We couldn't find any flights matching your current filters.
          </p>
          {selectedYears.length > 0 && (
            <Button variant="link" onClick={() => setSelectedYears([])} className="mt-4 text-primary gap-2">
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <FlightTable flights={filteredFlights} onRefresh={fetchFlights} />
      )}

      <div className="flex justify-center pt-8">
        <p className="text-[10px] text-muted-foreground">
          Airline logos provided by <a href="https://logos.apistemic.com/" className="hover:underline" target="_blank" rel="noopener noreferrer">Apistemic</a>
        </p>
      </div>
    </div>
  );
}
