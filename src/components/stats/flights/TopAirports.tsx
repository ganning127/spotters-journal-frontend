import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Spinner } from "../../ui/spinner";
import type { TopAirportResponse } from "@/types";
import { MapPin } from "lucide-react";

export const TopAirports = () => {
  const [loading, setLoading] = useState(true);
  const [airports, setAirports] = useState<TopAirportResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/flight-stats/airports");
        setAirports(res.data.slice(0, 5)); // show top 5
      } catch (err) {
        console.error("Failed to fetch top airports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;
  if (airports.length === 0) return <div>No airport data available.</div>;

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6 h-full hover:shadow-md transition-all">
      <h3 className="font-semibold text-lg mb-4 text-card-foreground">Most Visited Airports</h3>
      <div className="flex flex-col gap-3 justify-center flex-1">
        {airports.map((airport, idx) => (
          <div key={airport.icao_code} className="flex items-center justify-between py-2 border-b last:border-0 border-border/50">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground font-medium text-sm w-4">{idx + 1}.</span>
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-foreground text-lg">{airport.icao_code}</span>
                <span className="text-xs text-muted-foreground truncate w-32 sm:w-48 capitalize" title={airport.name}>{airport.name?.toLowerCase() || 'Unknown'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div className="flex flex-col">
                <span className="font-bold text-foreground">{airport.total_visits}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Visits</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
