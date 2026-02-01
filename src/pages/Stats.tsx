import { AirlineCounts } from "@/components/stats/AirlineCounts";
import { AirplaneCounts } from "@/components/stats/AirplaneCounts";
import { AirportCounts } from "@/components/stats/AirportCounts";
import { ManufacturerCounts } from "@/components/stats/ManufacturerCounts";
import {
  MOST_SEEN_AIRCRAFT_LIMIT,
  MostSeenAircraft,
} from "@/components/stats/MostSeenAircraft";
import { PhotoCounts } from "@/components/stats/PhotoCounts";

export const Stats = () => {
  return (
    <>
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Top {MOST_SEEN_AIRCRAFT_LIMIT} most seen aircraft
          </h2>
          <MostSeenAircraft />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AirlineCounts />
          <AirportCounts />
          <ManufacturerCounts />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-8">
            <PhotoCounts />
          </div>
          <div className="md:col-span-4">
            <AirplaneCounts />
          </div>
        </div>
      </div>
    </>
  );
};
