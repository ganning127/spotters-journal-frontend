import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Spinner } from "../../ui/spinner";
import type { TopRegistrationResponse } from "@/types";
import { Camera } from "lucide-react";

export const TopRegistrations = () => {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<TopRegistrationResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/flight-stats/registrations");
        setRegistrations(res.data.slice(0, 4)); // top 4 looks good in grid
      } catch (err) {
        console.error("Failed to fetch top registrations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;
  if (registrations.length === 0) return <div>No airplane registration data available.</div>;

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6 h-full hover:shadow-md transition-all">
      <h3 className="font-semibold text-lg mb-4 text-card-foreground">Top Individual Airplanes</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {registrations.map((reg) => (
          <div key={reg.uuid_rh} className="group relative rounded-xl border overflow-hidden bg-secondary/30 flex flex-col">
            {reg.cover_photo ? (
              <div className="relative h-32 w-full overflow-hidden">
                <img
                  src={reg.cover_photo}
                  alt={reg.registration}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-3 left-3 flex flex-col text-white">
                  <span className="font-bold text-lg leading-tight tracking-wider">{reg.registration}</span>
                  <span className="text-xs text-white/80">{reg.manufacturer} {reg.type}</span>
                </div>
              </div>
            ) : (
              <div className="relative h-32 w-full bg-muted/50 flex flex-col items-center justify-center border-b">
                <Camera className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <span className="font-bold text-lg text-foreground/80 tracking-wider">{reg.registration}</span>
                <span className="text-xs text-muted-foreground">{reg.manufacturer} {reg.type}</span>
              </div>
            )}

            <div className="p-3 flex justify-between items-center text-sm bg-card/50 backdrop-blur-sm z-10 w-full">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Flights</span>
                <span className="font-bold text-foreground">{reg.flight_count}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Miles</span>
                <span className="font-bold text-foreground">{reg.total_distance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
