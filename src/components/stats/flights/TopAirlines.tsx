import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Spinner } from "../../ui/spinner";
import type { TopAirlineResponse } from "@/types";
import { AirlineLogo } from "@/components/AirlineLogo";

export const TopAirlines = () => {
  const [loading, setLoading] = useState(true);
  const [airlines, setAirlines] = useState<TopAirlineResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/flight-stats/airlines");
        setAirlines(res.data.slice(0, 5)); // show top 5
      } catch (err) {
        console.error("Failed to fetch top airlines", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;
  if (airlines.length === 0) return <div>No airline data available.</div>;

  const maxMiles = Math.max(...airlines.map(a => a.total_distance));

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col hover:shadow-md transition-all">
      <h3 className="font-semibold text-lg mb-4 text-card-foreground">Most Flown Airlines</h3>
      <div className="flex flex-col gap-4 justify-center">
        {airlines.map((airline, idx) => {
          const percentage = `${(airline.total_distance / maxMiles) * 100}%`;
          return (
            <div key={airline.code} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground w-4">{idx + 1}.</span>
                  <AirlineLogo domain={airline.domain} className="w-5 h-5" />
                  <span className="font-medium">{airline.name}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>{airline.flight_count} flights</span>
                  <span className="font-medium text-foreground">{airline.total_distance.toLocaleString()} <span className="text-xs font-normal">mi</span></span>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden ring-1 ring-inset ring-black/5">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-1"
                  style={{
                    width: percentage,
                    backgroundColor: airline.brand_color || 'hsl(var(--primary))'
                  }}
                >
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
