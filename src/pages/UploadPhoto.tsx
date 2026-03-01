import { useState, useEffect } from "react";

import api from "../api/axios";
import type { UploadPhotoRequest } from "../types";
import { Button } from "../components/ui/button";
import { AirportAutocomplete } from "@/components/ui/airport-autocomplete";
import { Field, FieldDescription, FieldSet } from "@/components/ui/field";
import { Section } from "@/components/upload/Section";
import { AddImageExif } from "@/components/upload/AddImageExif";
import { cn, CACHED_SELECTION_KEY } from "@/lib/utils";
import { toast } from "sonner";
import { AddRegistration } from "@/components/upload/AddRegistration";
import { ImagePlus, Plane, MapPin, Camera, CheckCircle, Calendar } from "lucide-react";
import { UploadSteps } from "@/components/upload/UploadSteps";
import { ImageMagnifier } from "@/components/ui/image-magnifier";

const defaultData = {
  registration: "",
  airport_code: "",
  taken_at: "",
  shutter_speed: "",
  iso: 0,
  aperture: "",
  camera_model: "",
  focal_length: "",
  airline_code: "",

  uuid_rh: "", // Add default for uuid_rh

  aircraft_type_id: "",
  manufactured_date: "",
} as UploadPhotoRequest;

const STEPS = [
  { id: 1, label: "Upload" },
  { id: 2, label: "Metadata" },
  { id: 3, label: "Registration" },
  { id: 4, label: "Location" },
  { id: 5, label: "Review" },
];

export default function UploadPhoto() {
  const [formData, setFormData] = useState(defaultData);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Auto-advance to next step if it's the first time
      if (step === 1) setStep(2);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (step === 1) setStep(2);
    }
  };

  const nextStep = () => {
    if (step === 1 && !selectedFile) {
      toast.error("Please select an image first.");
      return;
    }
    if (step == 2 && !formData.taken_at) {
      toast.error("Please enter when the photo was taken.");
      return;
    }
    if (step === 3) {
      if (!formData.registration) {
        toast.error("Please enter a registration.");
        return;
      } else {
        // pre-populate local storage
        const lastUsedAirport = localStorage.getItem("lastUsedAirport");
        if (lastUsedAirport) {
          try {
            const airportInfo = JSON.parse(lastUsedAirport);
            console.log("airportInfo", airportInfo);

            setFormData((prev) => {
              return {
                ...prev,
                airport_code: airportInfo.icao_code,
              }
            })
          } catch (e) {
            console.error("lastUsedAirport population failed: ", lastUsedAirport);
          }
        }
      }
    }
    if (step === 4 && !formData.airport_code) {
      toast.error("Please select an airport.");
      return;
    }
    setStep((s) => Math.min(s + 1, 5));
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.code === "Enter") &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLButtonElement)
      ) {
        e.preventDefault();
        if (step < 5) {
          nextStep();
        } else if (step === 5 && !loading) {
          handleSubmit();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, selectedFile, formData.registration, formData.airport_code, formData.taken_at, loading]);

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select an image file.");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("image", selectedFile);
      data.append("registration", formData.registration);
      data.append("airport_code", formData.airport_code);
      data.append("taken_at", formData.taken_at || "");
      data.append("shutter_speed", formData.shutter_speed || "");
      data.append("iso", formData.iso ? formData.iso.toString() : "");
      data.append("aperture", formData.aperture || "");
      data.append("camera_model", formData.camera_model || "");
      data.append("focal_length", formData.focal_length || "");
      data.append("airline_code", formData.airline_code || "");

      if (formData.aircraft_type_id) {
        data.append("aircraft_type_id", formData.aircraft_type_id);
      }
      if (formData.uuid_rh) {
        data.append("uuid_rh", formData.uuid_rh);
      }
      if (formData.manufactured_date) {
        data.append("manufactured_date", formData.manufactured_date);
      }

      data.append("airport_latitude", formData.airport_latitude ? formData.airport_latitude.toString() : "");
      data.append("airport_longitude", formData.airport_longitude ? formData.airport_longitude.toString() : "");

      await api.post("/photos", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Photo uploaded successfully!");
      localStorage.removeItem(CACHED_SELECTION_KEY);
      setFormData(defaultData);
      setSelectedFile(null);
      setPreviewUrl(null);
      setStep(1);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Upload Photo</h1>
        <p className="text-muted-foreground">Share your best shots with the community.</p>
      </div>

      <UploadSteps currentStep={step} steps={STEPS} />

      <div className="bg-card border rounded-xl p-6 shadow-sm relative overflow-hidden">
        {/* Step 1: Photo */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <ImagePlus size={24} />
              </div>
              <h2 className="text-xl font-semibold">Select Photo</h2>
            </div>

            <Section className="border-none p-0">
              {!selectedFile ? (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-16 flex flex-col items-center justify-center transition-all cursor-pointer relative bg-muted/20",
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-border/50 hover:border-primary/50 hover:bg-muted/40"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="p-4 bg-background rounded-full shadow-sm mb-4">
                    <ImagePlus
                      size={32}
                      className={cn(
                        "transition-colors",
                        isDragging ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <p className={cn("text-lg font-medium transition-colors mb-2", isDragging && "text-primary")}>
                    {isDragging ? "Drop to Upload" : "Click or Drag to Upload"}
                  </p>
                  <p className="text-sm text-muted-foreground">JPEG, PNG up to 10MB</p>
                </div>
              ) : (
                <div className="relative group">
                  <img
                    src={previewUrl!}
                    alt="Preview"
                    className="w-full max-h-[400px] object-contain rounded-lg bg-muted shadow-inner"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      Change Photo
                    </Button>
                  </div>
                </div>
              )}
            </Section>
          </div>
        )}

        {/* Step 2: Metadata */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Camera size={24} />
              </div>
              <h2 className="text-xl font-semibold">Photo Details</h2>
            </div>

            <Section className="border-none p-0">
              <AddImageExif formData={formData} setFormData={setFormData} file={selectedFile} onAutoAdvance={() => setStep(3)} />
            </Section>
          </div>
        )}

        {/* Step 3: Aircraft */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Plane size={24} />
              </div>
              <h2 className="text-xl font-semibold">Aircraft Details</h2>
            </div>

            <div className="space-y-6">
              <Section className="border-none p-0">
                <AddRegistration formData={formData} setFormData={setFormData} />
              </Section>
              {previewUrl && (
                <div className="w-full bg-muted/30 rounded-lg p-2 flex flex-col items-center gap-2 border border-dashed">
                  {formData.taken_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                      <Calendar size={14} />
                      <span>
                        Taken {new Date(formData.taken_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}
                      </span>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">Hover over the image to enlarge the aircraft&apos;s registration</p>

                  <ImageMagnifier
                    src={previewUrl}
                    alt="Reference"
                    className="rounded-lg shadow-sm max-h-[400px]"
                  />

                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <MapPin size={24} />
              </div>
              <h2 className="text-xl font-semibold">Location</h2>
            </div>

            <Section className="border-none p-0">
              <FieldSet>
                <Field>Airport</Field>
                <FieldDescription className="mb-2">Where was this photo taken?</FieldDescription>
                <AirportAutocomplete
                  value={formData.airport_code}
                  placeholder="ICAO code or airport name"
                  onChange={(val, airport) => {
                    setFormData((prev) => ({
                      ...prev,
                      airport_code: val,
                      ...(airport && {
                        airport_icao_code: airport.icao_code,
                        airport_name: airport.name,
                        airport_latitude: airport.latitude,
                        airport_longitude: airport.longitude,
                      }),
                    }));
                    if (airport) {
                      localStorage.setItem(
                        "lastUsedAirport",
                        JSON.stringify({
                          icao_code: airport.icao_code,
                          name: airport.name,
                        }),
                      );
                    } else if (!val) {
                      localStorage.removeItem("lastUsedAirport");
                    }
                  }}
                />
              </FieldSet>
            </Section>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <CheckCircle size={24} />
              </div>
              <h2 className="text-xl font-semibold">Review & Submit</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <img
                  src={previewUrl!}
                  alt="Preview"
                  className="w-full rounded-lg shadow-sm border"
                />
              </div>
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registration</span>
                    <p className="font-semibold text-lg">{formData.registration}</p>
                    {formData.aircraft_type_id && (
                      <p className="text-sm text-muted-foreground">{formData.aircraft_type_id}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</span>
                    <p className="font-medium">{formData.airport_code}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date Taken</span>
                    <p className="font-medium">
                      {formData.taken_at ? new Date(formData.taken_at).toLocaleString() : "Unknown"}
                    </p>
                  </div>
                  {(formData.camera_model || formData.shutter_speed) && (
                    <div className="pt-2 border-t">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exif Data</span>
                      <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
                        {formData.camera_model && <div>Camera: {formData.camera_model}</div>}
                        {formData.shutter_speed && <div>Shutter: {formData.shutter_speed}</div>}
                        {formData.aperture && <div>Aperture: {formData.aperture}</div>}
                        {formData.iso && <div>ISO: {formData.iso}</div>}
                        {formData.focal_length && <div className="col-span-2">Focal Length: {formData.focal_length}</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1 || loading}
            className={cn(step === 1 && "invisible")}
          >
            Back
          </Button>

          {step < 5 ? (
            <Button onClick={nextStep}>
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 min-w-[120px]"
            >
              {loading ? "Uploading..." : "Submit Photo"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
