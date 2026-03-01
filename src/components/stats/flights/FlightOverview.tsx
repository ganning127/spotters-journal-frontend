import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Spinner } from "../../ui/spinner";
import { Timer, Compass, PlaneTakeoff } from "lucide-react";
import type { FlightOverviewResponse } from "@/types";
import { cn } from "@/lib/utils";

interface OverviewCardProps {
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  mainValue: React.ReactNode;
  subValue?: React.ReactNode;
}

const OverviewCard = ({ icon, iconClassName, title, mainValue, subValue }: OverviewCardProps) => (
  <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", iconClassName)}>
      {icon}
    </div>
    <div className="flex flex-col">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold">{mainValue}</p>
      {subValue && <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>}
    </div>
  </div>
);

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
      <OverviewCard
        icon={<PlaneTakeoff className="w-6 h-6" />}
        iconClassName="bg-primary/10 text-primary"
        title="Total Flights"
        mainValue={data.totalFlights.toLocaleString()}
      />
      <OverviewCard
        icon={<Compass className="w-6 h-6" />}
        iconClassName="bg-blue-500/10 text-blue-500"
        title="Total Distance"
        mainValue={
          <>
            {data.totalDistance.toLocaleString()} <span className="text-lg text-muted-foreground font-normal">mi</span>
          </>
        }
        subValue={`or ${(data.totalDistance / 24901).toFixed(1)}x around the globe`}
      />
      <OverviewCard
        icon={<Timer className="w-6 h-6" />}
        iconClassName="bg-emerald-500/10 text-emerald-500"
        title="Total Time in Air"
        mainValue={formatAirTime(data.totalAirTimeMinutes)}
        subValue={`or ${(data.totalAirTimeMinutes / 60 / 24).toFixed(1)} days`}
      />
    </div>
  );
};

