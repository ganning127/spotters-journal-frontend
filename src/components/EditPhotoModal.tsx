
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddRegistration } from "@/components/upload/AddRegistration";
import { AddImageExif } from "@/components/upload/AddImageExif";
import { AirportSelector } from "@/components/upload/AirportSelector";
import type { Photo, UploadPhotoRequest } from "@/types";
import api from "@/api/axios";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { getAircraftName } from "@/util/naming";
import { Separator } from "@/components/ui/separator";

interface EditPhotoModalProps {
  photo: Photo;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditPhotoModal({ photo, isOpen, onClose, onUpdate }: EditPhotoModalProps) {
  const [formData, setFormData] = useState<UploadPhotoRequest>({
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
    manufactured_date: undefined, // This expects string | undefined likely? Check logic.
    airline_code: "",
    uuid_rh: "",
    airport_icao_code: "",
    airport_name: "",
    airport_latitude: undefined,
    airport_longitude: undefined,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && photo) {
      // Initialize form data from photo
      const { RegistrationHistory } = photo;
      const { SpecificAircraft } = RegistrationHistory;

      setFormData({
        registration: RegistrationHistory.registration,
        airport_code: photo.airport_code,
        image_url: photo.image_url,
        taken_at: photo.taken_at ? new Date(photo.taken_at).toISOString().slice(0, 16) : "",
        shutter_speed: photo.shutter_speed || "",
        iso: photo.iso || 0,
        aperture: photo.aperture || "",
        camera_model: photo.camera_model || "",
        focal_length: photo.focal_length || "",

        // These are tricky: if they change registration, we need them cleared/reset to new values. 
        // Start with current values so "AddRegistration" knows initial state.
        aircraft_type_id: SpecificAircraft.icao_type,
        airline_code: RegistrationHistory.airline || "",
        uuid_rh: photo.uuid_rh, // Important: existing mapping

        // Airport fields (not editing airport for now as per prompt "edit all info... aside from image")
        // But let's keep them empty unless we want to support airport edit too. 
        // For now, let's assume we are mostly focused on Aircraft/EXIF. 
        // If we want to support Airport edit, we'd need that UI too.
        airport_icao_code: "",
        airport_name: "",
        airport_latitude: undefined,
        airport_longitude: undefined,
        manufactured_date: undefined // Not easily available in flattened photo object unless we drill down often
      });
    }
  }, [isOpen, photo]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/photos/${photo.id}`, {
        ...formData,
        // Ensure numbers are numbers
        iso: Number(formData.iso),
      });
      toast.success("Photo updated successfully");
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error("Failed to update photo", error);
      toast.error(error.response?.data?.error || "Failed to update photo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Edit Photo Details</DialogTitle>
          <DialogDescription>
            Update information for {getAircraftName(photo, false)} ({photo.RegistrationHistory.registration})
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">

            {/* 1. Registration / Aircraft Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Aircraft Details</h3>
              <AddRegistration formData={formData} setFormData={setFormData} isEditMode={true} />
            </div>

            <Separator />

            {/* 2. EXIF Data Section */}
            <div>
              <div className="col-span-full">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Photo Metadata</h3>
              </div>
              <AddImageExif formData={formData} setFormData={setFormData} file={null} />
            </div>

            <Separator />

            {/* 3. Airport Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Airport Details</h3>
              <AirportSelector formData={formData} setFormData={setFormData} disableAutoLoad={true} />
            </div>

          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Spinner className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent >
    </Dialog >
  );
}
