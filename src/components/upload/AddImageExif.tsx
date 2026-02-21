import type { UploadPhotoRequest } from "@/types";
import { Spinner } from "../ui/spinner";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import exifr from "exifr";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Check } from "lucide-react";

export const AddImageExif = ({
  formData,
  setFormData,
  file,
}: {
  formData: UploadPhotoRequest;
  setFormData: React.Dispatch<React.SetStateAction<UploadPhotoRequest>>;
  file: File | null;
}) => {
  const [extracting, setExtracting] = useState(false);
  const [allFieldsExtracted, setAllFieldsExtracted] = useState(false);

  useEffect(() => {
    if (file) {
      extractImageExif(file);
    }
  }, [file]);

  const extractImageExif = async (file: File) => {
    setExtracting(true);
    try {
      const output = await exifr.parse(file, {
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
        // Adjust for timezone offset to get local string representation
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
        setAllFieldsExtracted(true);
      }
    } catch (err) {
      console.error("Failed to extract EXIF.", err);
    } finally {
      setExtracting(false);
    }
  };

  const formatShutterSpeed = (exposureTime: number) => {
    if (!exposureTime) return "";
    if (exposureTime >= 1) return exposureTime.toString();
    const fraction = Math.round(1 / exposureTime);
    return `1/${fraction}`;
  };

  return (
    <>
      {extracting ? (
        <div className="md:col-span-3 flex justify-center py-4">
          <Spinner />
        </div>
      ) : (
        <>
          {
            allFieldsExtracted && (
              <Alert variant="success">
                <Check />
                <AlertTitle>EXIF data extracted successfully!</AlertTitle>
                <AlertDescription>
                  We've extracted all the EXIF data from the image. Feel free to edit if needed.
                </AlertDescription>
              </Alert>
            )
          }

          <div
            className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border", allFieldsExtracted ? "mt-4 bg-green-100 border-green-300" : "mt-0 bg-yellow-100 border-yellow-300")}
          >
            <div className="md:col-span-3">
              <label className="block text-xs text-gray-500 mb-1">
                Date Taken
              </label>
              <Input
                type="datetime-local"
                value={formData.taken_at}
                onChange={(e) =>
                  setFormData({ ...formData, taken_at: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Shutter</label>
              <Input
                type="text"
                placeholder="1/500"
                value={formData.shutter_speed}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shutter_speed: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Aperture</label>
              <Input
                type="text"
                placeholder="f/2.8"
                value={formData.aperture}
                onChange={(e) =>
                  setFormData({ ...formData, aperture: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">ISO</label>
              <Input
                type="number"
                placeholder="100"
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
              <Input
                type="text"
                placeholder="50mm"
                value={formData.focal_length}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    focal_length: e.target.value,
                  })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Camera</label>
              <Input
                type="text"
                placeholder="Nikon D850"
                value={formData.camera_model}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    camera_model: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};
