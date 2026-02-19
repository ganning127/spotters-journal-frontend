import api from "@/api/axios";
import type { UploadPhotoRequest } from "@/types";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, Calendar, MapPin } from "lucide-react";
import { Field, FieldSet } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { NewAircraftSelector } from "./NewAircraftSelector";
import { rectifyFormat, cn } from "@/lib/utils";
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

const AircraftInfoDisplay = ({ aircraft, currentTakenAt }: { aircraft: Suggestion; currentTakenAt?: string }) => {
  const userPhotos = aircraft.Photo || [];

  const isProximate = (photoDate: string) => {
      if (!currentTakenAt) return false;
      try {
          const d1 = new Date(currentTakenAt + (currentTakenAt.endsWith("Z") ? "" : "Z"));
          const d2 = new Date(photoDate); // these dates are not the actual time the photo was taken, but it's fine since we are comparing them with each other
          
          const diffMs = Math.abs(d1.getTime() - d2.getTime());
          const diffMins = diffMs / (1000 * 60);
          return diffMins <= 30;
      } catch (e) {
          return false;
      }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
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
      </div>

      {userPhotos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-3">
            {userPhotos.map((photo, index) => {
                const proximate = isProximate(photo.taken_at);
                return (
                <div 
                    key={index} 
                    className={cn(
                        "flex flex-col gap-2 p-2 rounded-lg border transition-colors relative",
                         proximate ? "bg-amber-500/10 border-amber-500/50 hover:bg-amber-500/20" : "bg-card/50 hover:bg-card border-border"
                    )}
                >
                    {proximate && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10">
                            WITHIN 30M
                        </div>
                    )}
                    <div className="w-full aspect-video rounded-md overflow-hidden border border-border/50 bg-muted relative group">
                        <img
                            src={photo.image_url}
                            alt={`Photo from ${photo.taken_at}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                    <div className="flex items-center justify-between px-1">
                        <div className={cn("flex items-center gap-1.5 text-xs", proximate ? "text-amber-600 font-medium" : "text-muted-foreground")}>
                            <Calendar className="w-3.5 h-3.5 opacity-70" />
                            <span>{rectifyFormat(photo.taken_at)}</span>
                        </div>
                         <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80 bg-secondary/50 px-1.5 py-0.5 rounded-sm">
                            <MapPin className="w-3.5 h-3.5 opacity-70" />
                            <span>{photo.airport_code}</span>
                        </div>
                    </div>
                </div>
            )})}
        </div>
      )}
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
                 <AircraftInfoDisplay aircraft={confirmedAircraft} currentTakenAt={formData.taken_at} />
                
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
                      <AircraftInfoDisplay aircraft={aircraft} currentTakenAt={formData.taken_at} />
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
