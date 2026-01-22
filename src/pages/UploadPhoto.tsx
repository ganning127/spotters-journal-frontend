import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import type { Airport, AircraftType } from "../types";
import exifr from "exifr";
import { Spinner } from "../components/ui/spinner";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";

export default function UploadPhoto() {
  const navigate = useNavigate();

  // Data State
  const [airports, setAirports] = useState<Airport[]>([]);
  const [aircraftTypes, setAircraftTypes] = useState<AircraftType[]>([]);
  const [loading, setLoading] = useState(true);

  // Autocomplete & New Aircraft State
  const [suggestions, setSuggestions] = useState<{ registration: string }[]>(
    [],
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isNewAircraft, setIsNewAircraft] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Metadata extraction state
  const [extracting, setExtracting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    registration: "",
    airport_code: "",
    image_url: "",
    taken_at: "",
    shutter_speed: "",
    iso: 100,
    aperture: "",
    camera_model: "",
    focal_length: "",
    aircraft_type_id: "",
    manufactured_date: "",
  });

  // 1. Initial Data Fetch (Airports & Types)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [airportRes, typeRes] = await Promise.all([
          api.get<Airport[]>("/airports"),
          api.get<AircraftType[]>("/aircraft-types"),
        ]);
        setAirports(airportRes.data);
        setAircraftTypes(typeRes.data);
      } catch (err) {
        console.error("Failed to load form data", err);
      } finally {
        setLoading(false);
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

  // Helper to format fraction for shutter speed
  const formatShutterSpeed = (exposureTime: number) => {
    if (!exposureTime) return "";
    if (exposureTime >= 1) return exposureTime.toString();
    const fraction = Math.round(1 / exposureTime);
    return `1/${fraction}`;
  };

  const extractImageExif = async (url: string) => {
    if (!url) return;

    setExtracting(true);
    try {
      // Parse the image (fetch happens automatically by exifr)
      const proxyUrl = "https://cors-anywhere.com/" + url;
      const output = await exifr.parse(proxyUrl, {
        pick: [
          "DateTimeOriginal",
          "ExposureTime",
          "ISO",
          "FNumber",
          "Model",
          "FocalLength",
        ],
      });

      if (!output) {
        return;
      }

      const updates: any = {};

      if (output.DateTimeOriginal) {
        // Convert Date object to "YYYY-MM-DDTHH:mm"
        const date = new Date(output.DateTimeOriginal);
        const offset = date.getTimezoneOffset() * 60000;
        const localISOTime = new Date(date.getTime() - offset)
          .toISOString()
          .slice(0, 16);
        updates.taken_at = localISOTime;
      }

      if (output.ExposureTime)
        updates.shutter_speed = formatShutterSpeed(output.ExposureTime);
      if (output.ISO) updates.iso = output.ISO;
      if (output.FNumber) updates.aperture = `f/${output.FNumber}`;
      if (output.Model) updates.camera_model = output.Model;
      if (output.FocalLength) updates.focal_length = `${output.FocalLength}mm`;

      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      if (Object.keys(updates).length == 6) {
        toast.success("EXIF data extracted successfully!");
      }
    } catch (err) {
      console.error("Failed to extract EXIF.", err);
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/photos", formData);
      navigate("/photos");
    } catch (err) {
      alert("Upload failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Log a Sighting</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ROW 1: Registration & Airport */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Autocomplete Registration Field */}
          <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration
            </label>
            <input
              type="text"
              placeholder="N12345"
              required
              className="w-full p-3 border rounded focus:border-black focus:outline-none uppercase"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Airport
            </label>
            <select
              required
              className="w-full p-3 border rounded bg-white focus:border-black focus:outline-none"
              value={formData.airport_code}
              onChange={(e) =>
                setFormData({ ...formData, airport_code: e.target.value })
              }
            >
              <option value="">Select Airport...</option>
              {!loading &&
                airports.map((airport) => (
                  <option key={airport.icao_code} value={airport.icao_code}>
                    {airport.icao_code} ({airport.name})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* CONDITIONAL: New Aircraft Details */}
        {isNewAircraft && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 animate-fade-in">
            <h3 className="text-sm font-bold text-blue-800 mb-3">
              New Aircraft Detected
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-blue-600 uppercase mb-1">
                  Aircraft Type
                </label>
                <select
                  required={isNewAircraft}
                  className="w-full p-2 border border-blue-200 rounded focus:border-blue-500 focus:outline-none text-sm"
                  value={formData.aircraft_type_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aircraft_type_id: e.target.value,
                    })
                  }
                >
                  <option value="">Select Type...</option>
                  {aircraftTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.manufacturer} {t.type} ({t.variant || t.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-600 uppercase mb-1">
                  Manufactured Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-blue-200 rounded focus:border-blue-500 focus:outline-none text-sm"
                  value={formData.manufactured_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      manufactured_date: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* ROW 2: Image URL (With Auto-Extract) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
            {extracting && (
              <span className="text-xs text-blue-600 ml-2 animate-pulse">
                Scanning metadata...
              </span>
            )}
          </label>
          <input
            type="url"
            placeholder="https://..."
            required
            className="w-full p-3 border rounded focus:border-black focus:outline-none"
            value={formData.image_url}
            onChange={(e) => {
              setFormData({ ...formData, image_url: e.target.value });
              extractImageExif(e.target.value);
            }}
          />
          {formData.image_url && (
            <img
              src={formData.image_url}
              alt="Preview"
              className="mt-4 w-full object-contain border border-gray-200 rounded"
            />
          )}
          <p className="text-xs text-gray-400 mt-1">
            Paste a direct link. We'll try to auto-fill camera stats.
          </p>
        </div>

        {/* ROW 4: EXIF Metadata Grid */}
        {formData.image_url && (
          <div
            className={cn(
              "grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded border border-gray-100",
              formData.taken_at &&
                formData.shutter_speed &&
                formData.aperture &&
                formData.iso &&
                formData.focal_length &&
                formData.camera_model
                ? "bg-green-100"
                : "bg-yellow-50",
            )}
          >
            <div className="md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
              EXIF Data
            </div>

            {extracting ? (
              <Spinner />
            ) : (
              <>
                <div className="md:col-span-3">
                  <label className="block text-xs text-gray-500 mb-1">
                    Date Taken
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full p-3 border rounded focus:border-black focus:outline-none"
                    value={formData.taken_at}
                    onChange={(e) =>
                      setFormData({ ...formData, taken_at: e.target.value })
                    }
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Shutter
              </label>
              <input
                type="text"
                placeholder="1/500"
                className="w-full p-2 border rounded text-sm"
                value={formData.shutter_speed}
                onChange={(e) =>
                  setFormData({ ...formData, shutter_speed: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Aperture
              </label>
              <input
                type="text"
                placeholder="f/2.8"
                className="w-full p-2 border rounded text-sm"
                value={formData.aperture}
                onChange={(e) =>
                  setFormData({ ...formData, aperture: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">ISO</label>
              <input
                type="number"
                placeholder="100"
                className="w-full p-2 border rounded text-sm"
                value={formData.iso}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    iso: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Focal Length
              </label>
              <input
                type="text"
                placeholder="50mm"
                className="w-full p-2 border rounded text-sm"
                value={formData.focal_length}
                onChange={(e) =>
                  setFormData({ ...formData, focal_length: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Camera</label>
              <input
                type="text"
                placeholder="Nikon D850"
                className="w-full p-2 border rounded text-sm"
                value={formData.camera_model}
                onChange={(e) =>
                  setFormData({ ...formData, camera_model: e.target.value })
                }
              />
            </div>
          </div>
        )}
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
