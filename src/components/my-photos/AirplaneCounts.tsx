import api from "@/api/axios";
import { useEffect, useState } from "react";
import type { AirplaneCountsResponse } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export const AirplaneCounts = () => {
  const [airplaneCounts, setAirplaneCounts] = useState<
    AirplaneCountsResponse[]
  >([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/photos/airplane-counts");
        setAirplaneCounts(res.data);
      } catch (err) {
        console.error("Failed to fetch airplane counts", err);
      } finally {
      }
    };
    fetchData();
  }, []);

  if (airplaneCounts.length === 0) {
    return <div>No airplane counts available</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
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
