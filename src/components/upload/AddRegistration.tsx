import api from "@/api/axios";
import type { UploadPhotoRequest } from "@/types";
import { useEffect, useState, memo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BadgeCheck } from "lucide-react";
import { Field, FieldSet } from "../ui/field";
import { Input } from "../ui/input";
import { NewAircraftSelector } from "./NewAircraftSelector";
import { Button } from "@/components/ui/button";
import { AircraftInfoDisplay } from "./AircraftInfoDisplay";
import type { Suggestion } from "@/types";

export const AddRegistration = memo(({
  formData,
  setFormData,
  editingPhotoId,
}: {
  formData: UploadPhotoRequest;
  setFormData: React.Dispatch<React.SetStateAction<UploadPhotoRequest>>;
  editingPhotoId?: number;
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [isNewAircraft, setIsNewAircraft] = useState(false);
  const [confirmedAircraft, setConfirmedAircraft] = useState<Suggestion | null>(null);

  useEffect(() => {
    if (formData.registration === "") {
      setSuggestions(null);
      setIsNewAircraft(false);
      setConfirmedAircraft(null);
      setFormData((prev) => ({
        ...prev,
        aircraft_type_id: "",
        airline_code: "",
        uuid_rh: "", // Clear UUID when registration changes
      }));
    }
  }, [formData.registration]);

  // Restore state on mount if registration exists
  useEffect(() => {
    const restoreState = async () => {
      if (!formData.registration) return;

      // 1. Check if we have uuid_rh (edit mode fetch)
      if (formData.uuid_rh) {
        try {
          const res = await api.get(`/aircraft/history/${formData.uuid_rh}`);
          setConfirmedAircraft(res.data);

          const registration = res.data.registration;
          const suggestions = await api.get(`/aircraft/search?q=${registration}`);
          setSuggestions(suggestions.data.aircraft);

          return;
        } catch (e) {
          console.error("Failed to fetch aircraft history", e);
        }
      }

      // 3. Check if it is a "New Aircraft" flow (derived from formData)
      if (!formData.uuid_rh && formData.aircraft_type_id) {
        setIsNewAircraft(true);
        return;
      }
    };

    // Only run if we don't have local state but do have form data (e.g. on mount/back navigation)
    if (!suggestions && !isNewAircraft && !confirmedAircraft && formData.registration) {
      restoreState();
    }
  }, [formData.registration, formData.uuid_rh]);

  const searchRegistrations = async () => {
    if (formData.registration === "") return;
    setLoading(true);
    try {
      const res = await api.get(`/aircraft/search?q=${formData.registration}`);
      const data = res.data;
      if (!data.is_new_aircraft) {
        setSuggestions(data.aircraft);
        setIsNewAircraft(false);
        setConfirmedAircraft(null);

        // Auto-select if only one result
        if (data.aircraft.length === 1) {
          const aircraft = data.aircraft[0];
          setConfirmedAircraft(aircraft);
          setFormData((prev) => ({
            ...prev,
            aircraft_type_id: aircraft.type_id,
            airline_code: aircraft.airline,
            uuid_rh: aircraft.uuid_rh, // Set UUID
          }));
        } else {
          // Clear any previous selections if multiple found (user must choose)
          setFormData((prev) => ({
            ...prev,
            aircraft_type_id: "",
            airline_code: "",
            uuid_rh: "", // Clear UUID
          }));
        }

      } else {
        setSuggestions(null);
        setIsNewAircraft(true);
        setConfirmedAircraft(null);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAircraft = (aircraft: Suggestion) => {
    setConfirmedAircraft(aircraft);
    setIsNewAircraft(false);
    setFormData((prev) => ({
      ...prev,
      aircraft_type_id: aircraft.type_id,
      airline_code: aircraft.airline || "",
      uuid_rh: aircraft.uuid_rh, // Set UUID
    }));
  };

  return (
    <div>
      <FieldSet>
        <Field>Registration</Field>
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="N374FR"
            required
            value={formData.registration}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                searchRegistrations();
              }
            }}
            disabled={loading}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                registration: e.target.value.trim().toUpperCase(),
                aircraft_type_id: "",
                airline_code: "",
                uuid_rh: "",
              }));
              setSuggestions(null);
              setIsNewAircraft(false);
              setConfirmedAircraft(null);
            }}
          />
          <Button
            type="button"
            onClick={searchRegistrations}
            disabled={loading || !formData.registration}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </FieldSet>

      {/* Case: Single Confirmed Aircraft (either auto-selected or user-selected) */}
      {confirmedAircraft && !isNewAircraft && (
        <Alert className="w-full mt-2 bg-green-100 border-none flex flex-col gap-2 opacity-75">
          <div className="flex items-start gap-2">
            <BadgeCheck />
            <div className="flex-1">
              <AlertDescription>
                <AircraftInfoDisplay aircraft={confirmedAircraft} currentTakenAt={formData.taken_at} editingPhotoId={editingPhotoId} />

                <div className="mt-2 flex items-center gap-2 text-success font-medium">
                  <button
                    className="text-xs text-muted-foreground hover:text-primary underline font-normal ml-auto"
                    onClick={() => {
                      setConfirmedAircraft(null);
                    }}
                  >
                    Change
                  </button>
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Case: Multiple Suggestions List (and none confirmed yet) */}
      {suggestions && !confirmedAircraft && !isNewAircraft && (
        <div className="mt-2 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground font-medium">Found {suggestions.length} aircraft for this registration:</p>
          {suggestions.map((aircraft, idx) => (
            <div key={idx} className="border rounded-lg p-3 flex flex-col gap-3 bg-card hover:bg-accent/50 transition-colors">
              <AircraftInfoDisplay aircraft={aircraft} currentTakenAt={formData.taken_at} editingPhotoId={editingPhotoId} />
              <Button size="sm" variant="secondary" className="w-full" onClick={() => handleSelectAircraft(aircraft)}>
                Select
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => setIsNewAircraft(true)}
          >
            None of these
          </Button>
        </div>
      )}


      {isNewAircraft && (
        <>
          <div className='bg-gray-100 p-4 rounded-lg mt-2'>
            <p className="text-sm text-muted-foreground font-medium">You&apos;re the first to add this aircraft on our platform! Please enter its information:</p>
            <NewAircraftSelector formData={formData} setFormData={setFormData} />
            {suggestions && (
              <button
                className="mt-2 text-sm text-muted-foreground hover:text-primary underline"
                onClick={() => {
                  setIsNewAircraft(false);
                  if (suggestions.length === 1) {
                    handleSelectAircraft(suggestions[0]);
                  }
                }}
              >
                Wait, go back to found aircraft
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.formData.registration === nextProps.formData.registration &&
    prevProps.formData.aircraft_type_id === nextProps.formData.aircraft_type_id &&
    prevProps.formData.airline_code === nextProps.formData.airline_code &&
    prevProps.formData.uuid_rh === nextProps.formData.uuid_rh &&
    prevProps.formData.taken_at === nextProps.formData.taken_at &&
    prevProps.editingPhotoId === nextProps.editingPhotoId &&
    prevProps.setFormData === nextProps.setFormData
  );
});

AddRegistration.displayName = "AddRegistration";
