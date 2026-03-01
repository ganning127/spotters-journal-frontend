import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Spinner } from "../../ui/spinner";
import type { TopRouteResponse } from "@/types";
import { MoveRight } from "lucide-react";

export const TopRoutes = () => {
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<TopRouteResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/flight-stats/routes");
        setRoutes(res.data.slice(0, 5)); // show top 5
      } catch (err) {
        console.error("Failed to fetch top routes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;
  if (routes.length === 0) return <div>No route data available.</div>;

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6 h-full hover:shadow-md transition-all">
      <h3 className="font-semibold text-lg mb-4 text-card-foreground">Most Flown Routes</h3>
      <div className="flex flex-col gap-4 justify-center flex-1">
        {routes.map((route, idx) => (
          <div key={route.route} className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30 hover:bg-secondary/60 transition-colors">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground font-medium text-sm w-4">{idx + 1}.</span>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <span className="font-bold text-lg">{route.dep_airport}</span>
                </div>
                <MoveRight className="w-4 h-4 text-muted-foreground" />
                <div className="text-center">
                  <span className="font-bold text-lg">{route.arr_airport}</span>
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col">
              <span className="font-bold text-foreground">{route.flight_count} <span className="text-xs font-normal text-muted-foreground uppercase tracking-wider">Flights</span></span>
              <span className="text-sm text-muted-foreground font-medium">{route.total_distance.toLocaleString()} mi</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
