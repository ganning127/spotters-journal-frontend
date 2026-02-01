import api from "@/api/axios";
import type { MostSeenAircraftResponse } from "@/types";
import { useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";

export const MOST_SEEN_AIRCRAFT_LIMIT = 8;

export const MostSeenAircraft = () => {
  const [loading, setLoading] = useState(true);
  const [mostSeenAircraft, setMostSeenAircraft] = useState<
    MostSeenAircraftResponse[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/photos/most-seen-aircraft", {
          params: { limit: MOST_SEEN_AIRCRAFT_LIMIT },
        });
        setMostSeenAircraft(res.data);
      } catch (err) {
        console.error("Failed to fetch most seen aircraft", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (mostSeenAircraft.length === 0) {
    return <div>No most seen aircraft available</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 justify-center">
      {mostSeenAircraft.map((aircraft) => (
        <AircraftBox key={aircraft.registration} info={aircraft} />
      ))}
    </div>
  );
};

export const AircraftBox = ({ info }: { info: MostSeenAircraftResponse }) => {
  return (
    <div className=" relative h-64 w-full max-w-sm overflow-hidden rounded-xl mx-auto">
      {/* Aircraft Photo Background */}
      <img
        src={info.image_url} // Ensure this matches your API response key
        alt={`${info.registration} - ${info.aircraft_type}`}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dark Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Bottom Information */}
      <div className="absolute bottom-0 left-0 p-4 text-white">
        <h3 className="text-lg font-bold tracking-wide">{info.registration}</h3>
        <p className="text-sm font-medium text-gray-200">
          {info.manufacturer} {info.aircraft_type} • seen {info.photo_count}{" "}
          times
        </p>
      </div>
    </div>
  );
};
