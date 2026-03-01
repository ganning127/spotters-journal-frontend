import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Spinner } from "../../ui/spinner";
import type { TopAircraftTypeResponse } from "@/types";
import { Plane } from "lucide-react";

export const TopAircraftTypes = () => {
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState<TopAircraftTypeResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/flight-stats/aircraft-types");
        setTypes(res.data.slice(0, 5)); // show top 5
      } catch (err) {
        console.error("Failed to fetch top aircraft types", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;
  if (types.length === 0) return <div>No aircraft type data available.</div>;

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6 h-full hover:shadow-md transition-all">
      <h3 className="font-semibold text-lg mb-4 text-card-foreground">Top Aircraft Types</h3>
      <div className="flex flex-col gap-3 justify-center flex-1">
        {types.map((type, idx) => (
          <div key={type.icao_type} className="flex items-center justify-between py-2 border-b last:border-0 border-border/50">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground font-medium text-sm w-4">{idx + 1}.</span>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Plane className="w-4 h-4" />
              </div>
              <p className="font-semibold text-foreground">{type.manufacturer} {type.type}</p>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div className="flex flex-col">
                <span className="font-bold text-foreground">{type.flight_count}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Flights</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
