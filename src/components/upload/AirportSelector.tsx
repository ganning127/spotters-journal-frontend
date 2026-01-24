import api from "@/api/axios";
import type { BasicAirportInfo } from "@/types";
import { useEffect, useState } from "react";

import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";

export const AirportSelector = ({
  formData,
  setFormData,
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const [airports, setAirports] = useState<BasicAirportInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BasicAirportInfo | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const airportRes = await api.get<BasicAirportInfo[]>(
          `/airports?q=${formData.airport_code}`,
        );
        setAirports(airportRes.data);
      } catch (err) {
        console.error("Failed to load airports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [formData.airport_code]);

  if (selected) {
    return (
      <div className="flex items-center justify-between">
        {selected.icao_code} ({selected.name})
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setFormData({
              ...formData,
              airport_code: "",
            });
            setSelected(null);
          }}
        >
          Change
        </Button>
      </div>
    );
  }

  return (
    <>
      {!selected && (
        <Input
          placeholder="ICAO code or airport name"
          value={formData.airport_code}
          onChange={(e) =>
            setFormData({
              ...formData,
              airport_code: e.target.value.toUpperCase(),
            })
          }
        />
      )}

      {loading && <Spinner className="mt-2" />}

      {!loading && airports.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {airports.map((airport) => {
            return (
              <div
                key={airport.icao_code}
                className="p-2 rounded-lg bg-blue-200 hover:bg-blue-300 cursor-pointer"
                onClick={() => {
                  setFormData({
                    ...formData,
                    airport_code: airport.icao_code,
                  });
                  setSelected(airport);
                }}
              >
                {airport.icao_code} ({airport.name})
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
