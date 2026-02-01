import api from "@/api/axios";
import { useEffect, useState } from "react";
import type { AirplaneCountsResponse } from "@/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Spinner } from "../ui/spinner";

const AIRPLANE_COUNTS_LIMIT = 8;

export const AirplaneCounts = () => {
  const [airplaneCounts, setAirplaneCounts] = useState<
    AirplaneCountsResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/photos/airplane-counts", {
          params: { limit: AIRPLANE_COUNTS_LIMIT },
        });
        setAirplaneCounts(res.data);
      } catch (err) {
        console.error("Failed to fetch airplane counts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (airplaneCounts.length === 0) {
    return <div>No airplane counts available</div>;
  }

  return (
    <div>
      <Table>
        <TableCaption>
          Top {AIRPLANE_COUNTS_LIMIT} airplane photo counts (all time)
        </TableCaption>
        <TableHeader className="bg-gray-300">
          <TableRow>
            <TableHead>Aircraft Type</TableHead>
            <TableHead className="text-right">Photos (all time)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {airplaneCounts.map((item) => (
            <TableRow key={item.airplane_code}>
              <TableCell>
                {item.airplane_manufacturer} {item.airplane_type}{" "}
                {item.airplane_variant}
              </TableCell>
              <TableCell className="text-right">{item.photo_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
