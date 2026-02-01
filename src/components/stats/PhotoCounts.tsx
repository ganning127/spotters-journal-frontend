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
import { Spinner } from "../ui/spinner";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const NUM_YEARS = 10;
export const PhotoCounts = () => {
  const [photoCounts, setPhotoCounts] = useState<PhotoCountItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/photos/photo-counts", {
          params: { num_years: NUM_YEARS },
        });
        setPhotoCounts(res.data);
      } catch (err) {
        console.error("Failed to fetch photo counts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

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
        text: `Photo Counts Per Year (last ${NUM_YEARS} years)`,
      },
    },
  };

  return (
    <div>
      <Line data={data} options={options} />
    </div>
  );
};
