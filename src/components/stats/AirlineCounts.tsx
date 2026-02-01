import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import type { AirlineCountsResponse } from "@/types";
import { Spinner } from "../ui/spinner";

ChartJS.register(ArcElement, Tooltip, Legend);

const AIRLINE_COUNTS_LIMIT = 10;

export const AirlineCounts = () => {
  const [loading, setLoading] = useState(true);
  const [airlineCounts, setAirlineCounts] = useState<AirlineCountsResponse[]>(
    [],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/photos/airline-counts", {
          params: { limit: AIRLINE_COUNTS_LIMIT },
        });
        setAirlineCounts(res.data);
      } catch (err) {
        console.error("Failed to fetch airline counts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (airlineCounts.length === 0) {
    return <div>No airline counts available</div>;
  }

  const data = {
    labels: airlineCounts.map((item) => item.airline_name),
    datasets: [
      {
        data: airlineCounts.map((item) => item.photo_count),
        backgroundColor: airlineCounts.map((item) => item.airline_color),
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true,
        text: `Top ${AIRLINE_COUNTS_LIMIT} airline photo counts (all time)`,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed || 0;
            return `Photos: ${value}`;
          },
        },
      },
    },
  };

  return (
    <div>
      <Pie data={data} options={options} />
    </div>
  );
};
