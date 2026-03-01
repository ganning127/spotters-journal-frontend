import { TopAirlines } from "@/components/stats/flights/TopAirlines";
import { TopRegistrations } from "@/components/stats/flights/TopRegistrations";
import { TopRoutes } from "@/components/stats/flights/TopRoutes";
import { TopAircraftTypes } from "@/components/stats/flights/TopAircraftTypes";
import { TopAirports } from "@/components/stats/flights/TopAirports";
import { FlightOverview } from "@/components/stats/flights/FlightOverview";

export const FlightStats = () => {
  return (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Flight Statistics</h1>
        <p className="text-muted-foreground">Detailed insights into your aviation journey.</p>
      </div>

      <FlightOverview />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-1">
          <TopAirlines />
        </div>
        <div className="lg:col-span-2">
          <TopRegistrations />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <TopAirports />
        <TopAircraftTypes />
        <TopRoutes />
      </div>
    </div>
  );
};
