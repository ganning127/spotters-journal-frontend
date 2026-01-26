import api from "@/api/axios";
import type { UploadPhotoRequest } from "@/types";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Field, FieldSet } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { NewAircraftSelector } from "./NewAircraftSelector";

interface Suggestion {
  type_id: string;
  Photo: { taken_at: string; image_url: string; airport_code: string }[];
}
export const AddRegistration = ({
  formData,
  setFormData,
}: {
  formData: UploadPhotoRequest;
  setFormData: React.Dispatch<React.SetStateAction<UploadPhotoRequest>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion | null>(null);
  const [isNewAircraft, setIsNewAircraft] = useState(false);

  const searchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/aircraft/search?q=${formData.registration}`);
      const data = res.data;
      setSuggestions(data.aircraft);
      setIsNewAircraft(data.is_new_aircraft);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search only when the user leaves the field
  const handleBlur = () => {
    searchRegistrations();
  };

  let mostRecentPhoto = suggestions?.Photo[0];

  return (
    <>
      <FieldSet>
        <Field>Registration</Field>
        <Input
          type="text"
          placeholder="N374FR"
          required
          value={formData.registration}
          onBlur={handleBlur}
          onChange={(e) => {
            // Only update state, do not trigger search
            setFormData({
              ...formData,
              registration: e.target.value.toUpperCase(),
            });
            // Optional: reset new aircraft status while typing to avoid confusion
            if (isNewAircraft) setIsNewAircraft(false);
          }}
        />
      </FieldSet>

      {loading && <Spinner className="mt-2" />}

      {mostRecentPhoto && (
        <>
          <Alert className="w-full mt-2 bg-purple-100 border-none">
            <AlertCircleIcon />
            <AlertTitle>
              Most recent photo for {formData.registration} (
              {suggestions?.type_id})
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
