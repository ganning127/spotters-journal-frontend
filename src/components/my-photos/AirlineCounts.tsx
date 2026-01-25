import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import type { AirlineCountsResponse } from "@/types";

ChartJS.register(ArcElement, Tooltip, Legend);

export const AirlineCounts = () => {
  const [airlineCounts, setAirlineCounts] = useState<AirlineCountsResponse[]>(
    [],
  );
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/photos/airline-counts");
        setAirlineCounts(res.data);
      } catch (err) {
        console.error("Failed to fetch airline counts", err);
      } finally {
      }
    };
    fetchData();
  }, []);

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
        text: "Airline Photo Counts (all time)",
      },
    },
  };

  return (
    <div>
      <Pie data={data} options={options} />
    </div>
  );
};
