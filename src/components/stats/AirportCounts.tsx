import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import type { AirportCountsResponse } from "@/types";
import { Spinner } from "../ui/spinner";
import { stringToColour } from "@/lib/utils";

ChartJS.register(ArcElement, Tooltip, Legend);

const AIRPORT_COUNTS_LIMIT = 10;

export const AirportCounts = () => {
  const [loading, setLoading] = useState(true);
  const [airportCounts, setAirportCounts] = useState<AirportCountsResponse[]>(
    [],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/photos/airport-counts", {
          params: { limit: AIRPORT_COUNTS_LIMIT },
        });
        setAirportCounts(res.data);
      } catch (err) {
        console.error("Failed to fetch airport counts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (airportCounts.length === 0) {
    return <div>No airport counts available</div>;
  }

  const data = {
    // 1. Change labels to ONLY the ICAO code for the legend
    labels: airportCounts.map((item) => item.icao_code),
    datasets: [
      {
        data: airportCounts.map((item) => item.photo_count),
        backgroundColor: airportCounts.map((item) =>
          stringToColour(item.icao_code),
        ),
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: `Top ${AIRPORT_COUNTS_LIMIT} airport photo counts (all time)`,
      },
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: true,
        callbacks: {
          // 1. Tooltip Header: Show the ICAO Code
          title: (tooltipItems: any) => {
            return `Airport: ${tooltipItems[0].label}`;
          },
          // 2. Tooltip Body: Show the photo count
          label: (context: any) => {
            return ` Photos: ${context.raw}`;
          },
          // 3. Tooltip Footer: Show the full airport name
          footer: (tooltipItems: any) => {
            const index = tooltipItems[0].dataIndex;
            const item = airportCounts[index];
            return item.name;
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
