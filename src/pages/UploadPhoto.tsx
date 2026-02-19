import { useState } from "react";
import type { FormEvent } from "react";
import api from "../api/axios";
import type { UploadPhotoRequest } from "../types";
import { Button } from "../components/ui/button";
import { AirportSelector } from "@/components/upload/AirportSelector";
import { Field, FieldDescription, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/upload/Section";
import {} from "@radix-ui/react-select";
import { AddImageExif } from "@/components/upload/AddImageExif";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AddRegistration } from "@/components/upload/AddRegistration";

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/photos", formData);
      toast.success("Photo uploaded successfully!");
      setFormData(defaultData);
    } catch (err) {
      alert("Upload failed");
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
            <Field>Image URL</Field>
            <Input
              type="url"
              placeholder="https://..."
              required
              className="w-full"
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
                className="mt-4 w-full object-contain border border-border rounded-md bg-background"
              />

              <Section
                className={cn(
                  "mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-lg transition-colors",
                  formData.taken_at &&
                    formData.shutter_speed &&
                    formData.aperture &&
                    formData.iso &&
                    formData.focal_length &&
                    formData.camera_model
                    ? "bg-primary/5 border border-primary/20"
                    : "bg-yellow-500/10 border border-yellow-500/20",
                )}
              >
                <AddImageExif formData={formData} setFormData={setFormData} />
              </Section>
            </>
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
          variant={"outline"}
          className="w-full hover:cursor-pointer"
          size="lg"
          disabled={
            formData.registration.length === 0 ||
            formData.image_url.length === 0 ||
            formData.airport_code.length === 0
          }
        >
          {loading ? "Uploading..." : "Add Photo"}
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
