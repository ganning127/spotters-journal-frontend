import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Spinner } from "../../ui/spinner";
import { Timer, Compass, PlaneTakeoff } from "lucide-react";
import type { FlightOverviewResponse } from "@/types";

export const FlightOverview = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FlightOverviewResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/flight-stats/overview");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch flight overview stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <div>No flight overview data available.</div>;

  const formatAirTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <PlaneTakeoff className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Total Flights
          </p>
          <p className="text-3xl font-bold">{data.totalFlights.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Total Distance
          </p>
          <p className="text-3xl font-bold">
            {data.totalDistance.toLocaleString()} <span className="text-lg text-muted-foreground font-normal">mi</span>
          </p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
          <Timer className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Total Time in Air
          </p>
          <p className="text-3xl font-bold">
            {formatAirTime(data.totalAirTimeMinutes)}
          </p>
        </div>
      </div>
    </div>
  );
};
