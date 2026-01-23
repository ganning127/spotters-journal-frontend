import api from "@/api/axios";
import type { Airport } from "@/types";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const AirportSelector = ({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const airportRes = await api.get<Airport[]>("/airports");
        setAirports(airportRes.data);
      } catch (err) {
        console.error("Failed to load airports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <Select
      required
      value={formData.airport_code}
      onValueChange={(value) =>
        setFormData({ ...formData, airport_code: value })
      }
    >
      <SelectTrigger className="w-full p-2 rounded-lg text-md">
        <SelectValue placeholder="Select Airport..." />
      </SelectTrigger>
      <SelectContent>
        {!loading &&
          airports.map((airport) => (
            <SelectItem key={airport.icao_code} value={airport.icao_code}>
              {airport.icao_code} ({airport.name})
            </SelectItem>
          ))}
        <SelectItem value="other">Other</SelectItem>
      </SelectContent>
    </Select>
  );
};
