import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import type { ManufacturerCountsResponse } from "@/types";
import { Spinner } from "../ui/spinner";
import { stringToColour } from "@/lib/utils";

ChartJS.register(ArcElement, Tooltip, Legend);

const MANUFACTURER_COUNTS_LIMIT = 10;

export const ManufacturerCounts = () => {
  const [loading, setLoading] = useState(true);
  const [manufacturerCounts, setManufacturerCounts] = useState<
    ManufacturerCountsResponse[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/photos/manufacturer-counts", {
          params: { limit: MANUFACTURER_COUNTS_LIMIT },
        });
        setManufacturerCounts(res.data);
      } catch (err) {
        console.error("Failed to fetch manufacturer counts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (manufacturerCounts.length === 0) {
    return <div>No manufacturer counts available</div>;
  }

  const data = {
    // 1. Change labels to ONLY the ICAO code for the legend
    labels: manufacturerCounts.map((item) => item.manufacturer),
    datasets: [
      {
        data: manufacturerCounts.map((item) => item.photo_count),
        backgroundColor: manufacturerCounts.map((item) =>
          stringToColour(item.manufacturer),
        ),
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: `Top ${MANUFACTURER_COUNTS_LIMIT} manufacturer photo counts (all time)`,
      },
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: true,
        callbacks: {
          label: (context: any) => {
            return ` Photos: ${context.raw}`;
          },
        },
      },
    },
  };
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Pie data={data} options={options} />
    </div>
  );
};
