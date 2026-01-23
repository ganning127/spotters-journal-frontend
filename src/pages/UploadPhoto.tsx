import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import api from "../api/axios";
import type { AircraftType, UploadPhotoRequest } from "../types";
import { Button } from "../components/ui/button";
import { AirportSelector } from "@/components/upload/AirportSelector";
import { NewAirportInputs } from "@/components/upload/NewAirportInputs";
import { Field, FieldDescription, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/upload/Section";
import {} from "@radix-ui/react-select";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddImageExif } from "@/components/upload/AddImageExif";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const defaultData = {
  registration: "",
  airport_code: "",
  image_url: "",
  taken_at: "",
  shutter_speed: "",
  iso: 0,
  aperture: "",
  camera_model: "",
  focal_length: "",

  aircraft_type_id: "",
  manufactured_date: "",
} as UploadPhotoRequest;

export default function UploadPhoto() {
  // Data State
  const [aircraftTypes, setAircraftTypes] = useState<AircraftType[]>([]);

  // Autocomplete & New Aircraft State
  const [suggestions, setSuggestions] = useState<{ registration: string }[]>(
    [],
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isNewAircraft, setIsNewAircraft] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Metadata extraction state

  // Form State
  const [formData, setFormData] = useState(defaultData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const typeRes = await api.get<AircraftType[]>("/aircraft-types");
        setAircraftTypes(typeRes.data);
      } catch (err) {
        console.error("Failed to load form data", err);
      } finally {
      }
    };
    fetchData();

    // Click outside listener for autocomplete
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Search & New Aircraft Detection Logic
  useEffect(() => {
    const searchRegistrations = async () => {
      // Don't search for very short strings
      if (formData.registration.length < 3) {
        setSuggestions([]);
        setIsNewAircraft(false);
        return;
      }
      try {
        const res = await api.get(
          `/aircraft/search?q=${formData.registration}`,
        );
        setSuggestions(res.data);
        setShowSuggestions(true);

        // LOGIC: A plane is "New/Incomplete" if:
        // 1. No results found (length === 0)
        // 2. OR Result found, but the exact match has a NULL type_id (skeleton entry)
        const exactMatch = res.data.find(
          (p: any) => p.registration === formData.registration,
        );
        const needsDetails =
          res.data.length === 0 || (exactMatch && !exactMatch.type_id);

        setIsNewAircraft(needsDetails);
      } catch (error) {
        console.error("Search failed", error);
      }
    };

    const timeoutId = setTimeout(searchRegistrations, 300);
    return () => clearTimeout(timeoutId);
  }, [formData.registration]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/photos", formData);
      toast.success("Photo uploaded successfully!");
      setFormData(defaultData);
    } catch (err) {
      alert("Upload failed");
    }
  };

  const isNewAirport = formData.airport_code === "other";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload Photo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Section className="bg-purple-50">
          <div className="relative" ref={wrapperRef}>
            <FieldSet>
              <Field>Registration</Field>
              <Input
                type="text"
                placeholder="N374FR"
                required
                value={formData.registration}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    registration: e.target.value.toUpperCase(),
                  });
                }}
                onFocus={() =>
                  formData.registration.length >= 2 && setShowSuggestions(true)
                }
              />
            </FieldSet>

            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-b shadow-lg mt-1 max-h-48 overflow-y-auto">
                {suggestions.map((item) => (
                  <li
                    key={item.registration}
                    className="p-2 hover:bg-gray-100 cursor-pointer font-mono"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        registration: item.registration,
                      });
                      setShowSuggestions(false);
                      // If selected from list, we need to check if that specific one is complete
                      // (Usually searching again or passing data in suggestions is cleaner,
                      // but for now, the useEffect will re-run and verify completeness)
                    }}
                  >
                    {item.registration}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isNewAircraft && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldSet>
                  <Field>Aircraft Type</Field>

                  <Select
                    required={isNewAircraft}
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
                  <Field>Manufactured Date</Field>
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
            </div>
          )}
        </Section>

        <Section className="bg-blue-50">
          <FieldSet>
            <Field>Airport</Field>
            <AirportSelector formData={formData} setFormData={setFormData} />
          </FieldSet>

          {isNewAirport && (
            <div className="mt-2">
              <NewAirportInputs setFormData={setFormData} formData={formData} />
            </div>
          )}
        </Section>

        <Section className="bg-green-50">
          <FieldSet>
            <Field>Image URL</Field>
            <Input
              type="url"
              placeholder="https://..."
              required
              className="w-full p-2 border rounded-lg"
              value={formData.image_url}
              onChange={(e) => {
                setFormData({ ...formData, image_url: e.target.value });
              }}
            />
            <FieldDescription>
              Paste a direct link. We'll try to auto-fill photo metadata.
            </FieldDescription>
          </FieldSet>

          {/* ROW 4: EXIF Metadata Grid */}
          {isValidUrl(formData.image_url) && (
            <>
              <img
                src={formData.image_url}
                alt="Preview"
                className="mt-4 w-full object-contain border border-gray-200 rounded"
              />

              <Section
                className={cn(
                  "mt-2 grid grid-cols-2 md:grid-cols-3 gap-4",
                  formData.taken_at &&
                    formData.shutter_speed &&
                    formData.aperture &&
                    formData.iso &&
                    formData.focal_length &&
                    formData.camera_model
                    ? "bg-green-50"
                    : "bg-yellow-50",
                )}
              >
                <AddImageExif formData={formData} setFormData={setFormData} />
              </Section>
            </>
          )}
        </Section>

        <Button
          type="submit"
          variant={"outline"}
          className="w-full hover:cursor-pointer"
          size="lg"
          disabled={
            formData.registration.length === 0 ||
            formData.image_url.length === 0 ||
            formData.airport_code.length === 0
          }
        >
          Add Photo
        </Button>
      </form>
    </div>
  );
}

function isValidUrl(urlString: string) {
  try {
    // Attempt to create a new URL object
    new URL(urlString);
    return true;
  } catch (error) {
    // TypeError is thrown if the URL is invalid
    return false;
  }
}
