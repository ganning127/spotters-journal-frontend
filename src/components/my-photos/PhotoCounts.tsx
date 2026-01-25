import api from "@/api/axios";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import type { PhotoCountItem } from "@/types";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export const PhotoCounts = () => {
  const [photoCounts, setPhotoCounts] = useState<PhotoCountItem[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/photos/photo-counts");
        setPhotoCounts(res.data);
      } catch (err) {
        console.error("Failed to fetch photo counts", err);
      } finally {
      }
    };
    fetchData();
  }, []);

  if (photoCounts.length === 0) {
    return <div>No photo counts available</div>;
  }

  const data = {
    labels: photoCounts.map((item) => item.photo_year),
    datasets: [
      {
        data: photoCounts.map((item) => item.photo_count),
        borderColor: "rgba(0,0,0, 1)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Photo Counts Per Year (last 5 years)",
      },
    },
  };

  return (
    <div>
      <Line data={data} options={options} />
    </div>
  );
};
