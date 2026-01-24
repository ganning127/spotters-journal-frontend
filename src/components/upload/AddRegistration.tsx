import api from "@/api/axios";
import type { UploadPhotoRequest } from "@/types";
import { useState, useRef, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Field, FieldSet } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { NewAircraftSelector } from "./NewAircraftSelector";

export const AddRegistration = ({
  formData,
  setFormData,
}: {
  formData: UploadPhotoRequest;
  setFormData: React.Dispatch<React.SetStateAction<UploadPhotoRequest>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<
    {
      registration: string;
      type_id: string;
      Photo?: { taken_at: string; image_url: string; airport_code: string }[];
    }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isNewAircraft, setIsNewAircraft] = useState(false);

  // Form State
  const skipSearchRef = useRef(false);

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    if (formData.registration.length < 3) {
      setSuggestions([]);
      setIsNewAircraft(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    const searchRegistrations = async () => {
      // Don't search for very short strings
      try {
        const res = await api.get(
          `/aircraft/search?q=${formData.registration}`,
        );
        setSuggestions(res.data);
        setShowSuggestions(true);
        setIsNewAircraft(res.data.length === 0);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchRegistrations, 300);
    return () => clearTimeout(timeoutId);
  }, [formData.registration]);

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
    <>
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

      {loading && <Spinner className="mt-2" />}

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
        <NewAircraftSelector formData={formData} setFormData={setFormData} />
      )}
    </>
  );
};
