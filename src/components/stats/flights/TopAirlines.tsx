import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Spinner } from "../../ui/spinner";
import type { TopAirlineResponse } from "@/types";
import { AirlineLogo } from "@/components/AirlineLogo";
import { cn } from "@/lib/utils";

export const TopAirlines = () => {
  const [loading, setLoading] = useState(true);
  const [airlines, setAirlines] = useState<TopAirlineResponse[]>([]);
  const [metric, setMetric] = useState<"flights" | "time">("flights");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/flight-stats/airlines");
        setAirlines(res.data);
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

  const displayAirlines = [...airlines]
    .sort((a, b) => {
      if (metric === "flights") {
        return b.flight_count - a.flight_count || b.total_distance - a.total_distance;
      } else {
        return (b.total_time_mins || 0) - (a.total_time_mins || 0);
      }
    })
    .slice(0, 5);

  const maxVal = Math.max(...displayAirlines.map(a => metric === "flights" ? a.flight_count : (a.total_time_mins || 0)));

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-card-foreground">Most Flown Airlines</h3>
        <div className="flex bg-secondary p-1 rounded-lg text-xs">
          <button
            onClick={() => setMetric("flights")}
            className={cn("px-2 py-1 rounded-md transition-colors", metric === "flights" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:bg-secondary/50")}
          >
            Flights
          </button>
          <button
            onClick={() => setMetric("time")}
            className={cn("px-2 py-1 rounded-md transition-colors", metric === "time" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:bg-secondary/50")}
          >
            Time
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 justify-center">
        {displayAirlines.map((airline, idx) => {
          const val = metric === "flights" ? airline.flight_count : (airline.total_time_mins || 0);
          const percentage = `${maxVal === 0 ? 0 : (val / maxVal) * 100}%`;
          return (
            <div key={airline.code} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground w-4">{idx + 1}.</span>
                  <AirlineLogo domain={airline.domain} className="w-5 h-5" />
                  <span className="font-medium">{airline.name}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  {metric === "flights" ? (
                    <>
                      <span>{airline.flight_count} flights</span>
                      <span className="font-medium text-foreground">{airline.total_distance.toLocaleString()} <span className="text-xs font-normal">mi</span></span>
                    </>
                  ) : (
                    <>
                      <span>{airline.flight_count} flights</span>
                      <span className="font-medium text-foreground">{formatTime(airline.total_time_mins || 0)}</span>
                    </>
                  )}
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
