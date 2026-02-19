import api from "@/api/axios";
import type { UploadPhotoRequest } from "@/types";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Field, FieldSet } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { NewAircraftSelector } from "./NewAircraftSelector";
import { rectifyFormat } from "@/lib/utils";

import { Button } from "@/components/ui/button";

interface Suggestion {
  type_id: string;
  uuid_rh: string;
  airline?: string;
  airline_name?: string;
  Photo: { taken_at: string; image_url: string; airport_code: string }[];
  SpecificAircraft: {
    icao_type: string;
    manufacturer: string;
    type: string;
    variant: string;
  };
}

const AircraftInfoDisplay = ({ aircraft }: { aircraft: Suggestion }) => {
  const userPhoto =
    aircraft.Photo && aircraft.Photo.length > 0 ? aircraft.Photo[0] : null;

  return (
    <div className="flex flex-col gap-2 w-full">
      {userPhoto && (
        <div className="w-full aspect-video rounded-md overflow-hidden border border-border">
          <img
            src={userPhoto.image_url}
            alt="Your last photo"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div>
        <div className="font-medium text-lg leading-tight">
          {aircraft.SpecificAircraft.manufacturer} {aircraft.SpecificAircraft.type}
          {aircraft.SpecificAircraft.variant
            ? `-${aircraft.SpecificAircraft.variant}`
            : ""}
        </div>
        <div className="text-muted-foreground text-sm">
          {aircraft.airline_name || aircraft.airline || "Unknown Airline"}
        </div>
        {userPhoto && (
          <div className="text-xs text-muted-foreground mt-0.5">
            Your last photo: {rectifyFormat(userPhoto.taken_at)}
          </div>
        )}
      </div>
    </div>
  );
};

export const AddRegistration = ({
  formData,
  setFormData,
}: {
  formData: UploadPhotoRequest;
  setFormData: React.Dispatch<React.SetStateAction<UploadPhotoRequest>>;
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

  const searchRegistrations = async () => {
    if (formData.registration === "") return;
    setLoading(true);
    try {
      const res = await api.get(`/aircraft/search?q=${formData.registration}`);
      const data = res.data;
      if (!data.is_new_aircraft) {
        setSuggestions(data.aircraft); // This is now an array
        setIsNewAircraft(false);
        setConfirmedAircraft(null); 
        
        // Auto-select if only one result
        if (data.aircraft.length === 1) {
            setConfirmedAircraft(data.aircraft[0]);
             setFormData((prev) => ({
                ...prev,
                aircraft_type_id: data.aircraft[0].type_id,
                airline_code: data.aircraft[0].airline,
                uuid_rh: data.aircraft[0].uuid_rh, // Set UUID
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
    <>
      <FieldSet>
        <Field>Registration</Field>
        <Input
          type="text"
          placeholder="N374FR"
          required
          value={formData.registration}
          onBlur={searchRegistrations}
          onChange={(e) => {
            setFormData({
              ...formData,
              registration: e.target.value.toUpperCase(),
            });
            if (suggestions) setSuggestions(null);
            if (isNewAircraft) setIsNewAircraft(false);
            if (confirmedAircraft) {
                 setConfirmedAircraft(null);
                 setFormData(prev => ({ ...prev, uuid_rh: "" })); // Clear UUID if user changes registration text after determining it
            }
          }}
        />
      </FieldSet>

      {loading && <Spinner className="mt-2" />}

      {/* Case: Single Confirmed Aircraft (either auto-selected or user-selected) */}
      {confirmedAircraft && !isNewAircraft && (
         <Alert className="w-full mt-2 bg-secondary border-none flex flex-col gap-2 opacity-75">
          <div className="flex items-start gap-2">
            <AlertCircleIcon className="mt-1" />
            <div className="flex-1">
              <AlertTitle>
                 Found existing aircraft
              </AlertTitle>
              <AlertDescription>
                 <AircraftInfoDisplay aircraft={confirmedAircraft} />
                
                <div className="mt-2 flex items-center gap-2 text-success font-medium">
                    <span>✓ Confirmed</span>
                     <button 
                        className="text-xs text-muted-foreground hover:text-primary underline font-normal ml-auto"
                        onClick={() => {
                            setConfirmedAircraft(null);
                            setFormData(prev => ({ ...prev, uuid_rh: "" })); // Clear UUID on change
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
                      <AircraftInfoDisplay aircraft={aircraft} />
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
        </>
      )}
    </>
  );
};
