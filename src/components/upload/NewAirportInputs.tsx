import type { UploadPhotoRequest } from "@/types";
import { FormLabel } from "../FormLabel";
import { Field, FieldSet } from "../ui/field";
import { Input } from "../ui/input";

export const NewAirportInputs = ({
  formData,
  setFormData,
}: {
  formData: UploadPhotoRequest;
  setFormData: React.Dispatch<React.SetStateAction<UploadPhotoRequest>>;
}) => {
  return (
    <>
      <div className="space-y-2">
        <FieldSet>
          <Field>ICAO Code</Field>
          <Input
            placeholder="KATL"
            value={formData.airport_icao_code}
            onChange={(e) =>
              setFormData({
                ...formData,
                airport_icao_code: e.target.value.toUpperCase(),
              })
            }
          />
        </FieldSet>

        <FieldSet>
          <Field>Friendly Name</Field>
          <Input
            placeholder="Hartsfield-Jackson"
            value={formData.airport_name}
            onChange={(e) =>
              setFormData({
                ...formData,
                airport_name: e.target.value,
              })
            }
          />
        </FieldSet>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldSet>
            <Field>Latitude</Field>
            <Input
              type="number"
              step="any"
              placeholder="33.6407"
              required
              value={formData.airport_latitude}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  airport_latitude: parseFloat(e.target.value),
                })
              }
            />
          </FieldSet>

          <FieldSet>
            <Field>Longitude</Field>
            <Input
              type="number"
              step="any"
              placeholder="-84.4277"
              required
              value={formData.airport_longitude}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  airport_longitude: parseFloat(e.target.value),
                })
              }
            />
          </FieldSet>
        </div>
      </div>
    </>
  );
};
