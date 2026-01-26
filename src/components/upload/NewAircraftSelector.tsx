import api from "@/api/axios";
import type { AircraftType, Airline, UploadPhotoRequest } from "@/types";
import { useState, useEffect } from "react";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldSet } from "../ui/field";
import { Input } from "../ui/input";
import { toast } from "sonner";

export const NewAircraftSelector = ({
  formData,
  setFormData,
}: {
  formData: UploadPhotoRequest;
  setFormData: React.Dispatch<React.SetStateAction<UploadPhotoRequest>>;
}) => {
  const [aircraftTypes, setAircraftTypes] = useState<AircraftType[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const typeRes = await api.get<AircraftType[]>("/aircraft-types");
        setAircraftTypes(typeRes.data);
        const airlineRes = await api.get<Airline[]>("/airlines");
        setAirlines(airlineRes.data);
      } catch (err) {
        console.error("Failed to load form data", err);
      }
    };

    const prePopulateData = async () => {
      if (formData.registration === "") return;
      try {
        const res = await api.get(
          `/aircraft/new-registration?q=${formData.registration}`,
        );
        const data = res.data;
        console.log("Pre-populated data:", data);

        if (data.found) {
          setFormData({
            ...formData,
            aircraft_type_id: data.aircraft_type_id,
            airline_code: data.airline_code,
          });
        } else {
          toast.error("No data found for " + formData.registration);
          setFormData({
            ...formData,
            aircraft_type_id: "",
            airline_code: "",
          });
        }
      } catch (error) {
        console.error("Pre-population failed", error);
      }
    };

    prePopulateData();
    fetchData();
  }, []);

  useEffect(() => {
    if (airlines.length === 0) return;

    const registration = formData.registration.toUpperCase();
    const matchedAirline = airlines.find((airline) => {
      if (airline.reg_prefix) {
        let found = airline.reg_prefix.find((prefix) =>
          registration.startsWith(prefix),
        );
        if (found) return true;
      }

      if (airline.reg_suffix) {
        let found = airline.reg_suffix.find((suffix) => {
          return registration.endsWith(suffix);
        });
        if (found) return true;
      }
    });

    if (matchedAirline) {
      setFormData({
        ...formData,
        airline_code: matchedAirline.code,
      });
    }
  }, [formData.registration, airlines]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <div>
        <FieldSet>
          <Field>Aircraft Type</Field>

          <Select
            required={true}
            value={formData.aircraft_type_id}
            onValueChange={(value) => {
              setFormData({
                ...formData,
                aircraft_type_id: value,
              });
            }}
          >
            <SelectTrigger className="w-full p-2 rounded-lg text-md">
              <SelectValue placeholder="Select Aircraft..." />
            </SelectTrigger>
            <SelectContent>
              {aircraftTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.manufacturer} {t.type} ({t.variant || t.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldSet>
      </div>
      <div>
        <FieldSet>
          <Field>Manufactured/First Flight Date</Field>
          <Input
            type="date"
            value={formData.manufactured_date}
            onChange={(e) =>
              setFormData({
                ...formData,
                manufactured_date: e.target.value,
              })
            }
          />
        </FieldSet>
      </div>
      <div>
        <FieldSet>
          <Field>Airline</Field>
          <Select
            required={true}
            value={formData.airline_code}
            onValueChange={(value) => {
              setFormData({
                ...formData,
                airline_code: value,
              });
            }}
          >
            <SelectTrigger className="w-full p-2 rounded-lg text-md">
              <SelectValue placeholder="Select Airline..." />
            </SelectTrigger>
            <SelectContent>
              {airlines.map((a) => (
                <SelectItem key={a.code} value={a.code}>
                  {a.name} ({a.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldSet>
      </div>
    </div>
  );
};
