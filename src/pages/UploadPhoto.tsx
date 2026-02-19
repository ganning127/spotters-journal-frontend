import { useState } from "react";
import type { FormEvent } from "react";
import api from "../api/axios";
import type { UploadPhotoRequest } from "../types";
import { Button } from "../components/ui/button";
import { AirportSelector } from "@/components/upload/AirportSelector";
import { Field, FieldDescription, FieldSet } from "@/components/ui/field";
import { Section } from "@/components/upload/Section";
import { AddImageExif } from "@/components/upload/AddImageExif";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AddRegistration } from "@/components/upload/AddRegistration";
import { ImagePlus } from "lucide-react";

const defaultData = {
  registration: "",
  airport_code: "",
  image_url: "", // Still used as type dummy, but ignored in upload
  taken_at: "",
  shutter_speed: "",
  iso: 0,
  aperture: "",
  camera_model: "",
  focal_length: "",
  airline_code: "",

  aircraft_type_id: "",
  manufactured_date: "",

  airport_icao_code: "",
  airport_name: "",
  airport_latitude: 0,
  airport_longitude: 0,
} as UploadPhotoRequest;

export default function UploadPhoto() {
  const [formData, setFormData] = useState(defaultData);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
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
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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
      if (formData.manufactured_date) {
         data.append("manufactured_date", formData.manufactured_date);
      }

      // Airport 'other' fields
      data.append("airport_icao_code", formData.airport_icao_code || "");
      data.append("airport_name", formData.airport_name || "");
      data.append("airport_latitude", formData.airport_latitude ? formData.airport_latitude.toString() : "");
      data.append("airport_longitude", formData.airport_longitude ? formData.airport_longitude.toString() : "");

      await api.post("/photos", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Photo uploaded successfully!");
      setFormData(defaultData);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload Photo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Section className="bg-muted/30 border border-border p-4 rounded-lg">
          <FieldSet>
            <Field>Photo File</Field>
            
            {!selectedFile ? (
               <div 
                 className={cn(
                   "border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-all cursor-pointer relative",
                   isDragging 
                     ? "border-primary bg-primary/10 scale-[1.02]" 
                     : "border-border text-muted-foreground hover:bg-muted/50"
                 )}
                 onDragOver={handleDragOver}
                 onDragLeave={handleDragLeave}
                 onDrop={handleDrop}
               >
                 <input 
                   type="file" 
                   accept="image/*"
                   onChange={handleFileChange}
                   className="absolute inset-0 opacity-0 cursor-pointer"
                 />
                 <ImagePlus 
                   size={48} 
                   className={cn(
                     "mb-4 transition-opacity",
                     isDragging ? "opacity-100 text-primary" : "opacity-50"
                   )} 
                 />
                 <p className={cn("text-sm font-medium transition-colors", isDragging && "text-primary")}>
                   {isDragging ? "Drop to Upload" : "Click or Drag to Upload Image"}
                 </p>
                 <p className="text-xs text-muted-foreground mt-1">JPEG, PNG up to 10MB</p>
               </div>
            ) : (
                <div className="relative">
                    <img
                        src={previewUrl!}
                        alt="Preview"
                        className="w-full max-h-[400px] object-contain border border-border rounded-lg bg-black/5"
                    />
                    <Button 
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                        }}
                    >
                        Change Photo
                    </Button>
                </div>
            )}
            
            <FieldDescription>
              Select the photo you want to upload. We'll optimize it automatically.
            </FieldDescription>
          </FieldSet>

          {/* ROW 4: EXIF Metadata Grid */}
          {selectedFile && (
             <Section
                className={cn(
                  "mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-lg transition-colors",
                  formData.taken_at
                    ? "bg-primary/5 border border-primary/20"
                    : "bg-yellow-500/10 border border-yellow-500/20",
                )}
              >
                <AddImageExif formData={formData} setFormData={setFormData} file={selectedFile} />
              </Section>
          )}
        </Section>

        <Section className="bg-muted/30 border border-border p-4 rounded-lg">
          <AddRegistration formData={formData} setFormData={setFormData} />
        </Section>

        <Section className="bg-muted/30 border border-border p-4 rounded-lg">
          <FieldSet>
            <Field>Airport</Field>
            <AirportSelector formData={formData} setFormData={setFormData} />
          </FieldSet>
        </Section>

        <Button
          type="submit"
          variant={"default"}
          className="w-full hover:cursor-pointer"
          size="lg"
          disabled={
            formData.registration.length === 0 ||
            !selectedFile ||
            formData.airport_code.length === 0 || 
            loading
          }
        >
          {loading ? "Uploading & Processing..." : "Add Photo"}
        </Button>
      </form>
    </div>
  );
}
