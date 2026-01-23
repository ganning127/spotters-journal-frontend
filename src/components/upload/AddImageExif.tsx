import type { UploadPhotoRequest } from "@/types";
import { Spinner } from "../ui/spinner";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import exifr from "exifr";

export const AddImageExif = ({
  formData,
  setFormData,
}: {
  formData: UploadPhotoRequest;
  setFormData: React.Dispatch<React.SetStateAction<UploadPhotoRequest>>;
}) => {
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    extractImageExif(formData.image_url);
  }, [formData.image_url]);

  const extractImageExif = async (url: string) => {
    if (!url) return;

    setExtracting(true);
    try {
      let urlToUse =
        "https://dry-savannah-31116-8d7296f5ae66.herokuapp.com/" + url;

      const output = await exifr.parse(urlToUse, {
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
        toast.success("EXIF data extracted successfully!");
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
        <Spinner />
      ) : (
        <>
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
        </>
      )}
    </>
  );
};
