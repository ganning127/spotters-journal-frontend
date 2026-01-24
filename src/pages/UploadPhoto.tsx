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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

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
  const [suggestions, setSuggestions] = useState<
    {
      registration: string;
      type_id: string;
      Photo?: { taken_at: string; image_url: string; airport_code: string }[];
    }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isNewAircraft, setIsNewAircraft] = useState(false);
  const skipSearchRef = useRef(false);

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
  }, []);

  // 2. Search & New Aircraft Detection Logic
  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

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
        setIsNewAircraft(res.data.length === 0);
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
  let mostRecentPhoto;

  let filteredSuggestions = suggestions.filter(
    (item) => item.registration === formData.registration,
  );
  if (filteredSuggestions.length > 0) {
    const item = filteredSuggestions[0];
    if (item.Photo) {
      mostRecentPhoto = item.Photo[0];
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload Photo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Section className="bg-purple-50">
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
            />
          </FieldSet>

          {showSuggestions && suggestions.length > 0 && (
            <div className="flex flex-row flex-wrap gap-2 mt-2 text-sm text-gray-600">
              {suggestions.map((item) => (
                <div
                  key={item.registration}
                  className="px-3 py-1 bg-purple-200 rounded-lg hover:bg-purple-300 cursor-pointer"
                  onClick={() => {
                    skipSearchRef.current = true;
                    setFormData({
                      ...formData,
                      registration: item.registration,
                    });
                    setShowSuggestions(false);
                  }}
                >
                  {item.registration}
                </div>
              ))}
            </div>
          )}

          {mostRecentPhoto && (
            <>
              <Alert className="w-full mt-2 bg-purple-100 border-none">
                <AlertCircleIcon />
                <AlertTitle>
                  Most recent photo for {formData.registration}
                </AlertTitle>
                <AlertDescription>
                  <img
                    src={mostRecentPhoto.image_url}
                    alt="Most recent aircraft"
                    className="w-1/2 mx-auto border border-purple-300 rounded"
                  />
                  <p className="text-center w-full">
                    {mostRecentPhoto.airport_code} •{" "}
                    {new Date(mostRecentPhoto.taken_at).toLocaleString()}
                  </p>
                </AlertDescription>
              </Alert>
            </>
          )}

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
