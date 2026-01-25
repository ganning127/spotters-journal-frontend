import { AirlineCounts } from "@/components/my-photos/AirlineCounts";
import { AirplaneCounts } from "@/components/my-photos/AirplaneCounts";
import { PhotoCounts } from "@/components/my-photos/PhotoCounts";

export const Stats = () => {
  return (
    <>
      <h1 className="text-3xl font-bold">Statistics</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-8 mb-8">
        <AirlineCounts />
        <AirplaneCounts />
        <PhotoCounts />
      </div>
    </>
  );
};
