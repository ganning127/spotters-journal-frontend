import type { Airport, Photo } from "@/types";

export const getAircraftName = (photo: Photo, short: boolean) => {
  const manufacturer =
    photo.RegistrationHistory.SpecificAircraft.AircraftType.manufacturer;
  const type = photo.RegistrationHistory.SpecificAircraft.AircraftType.type;
  const variant = photo.RegistrationHistory.SpecificAircraft.AircraftType.variant;

  if (short) {
    return photo.RegistrationHistory.SpecificAircraft.AircraftType.icao_type;
  }

  return getAircraftNameFromFields(manufacturer, type, variant);
};

export const getAircraftNameFromFields = (manufacturer: string, type: string, variant: string) => {
  let result = "";
  if (manufacturer) {
    if (manufacturer == "Airbus") {
      result += "A";
    } else if (manufacturer == "Embraer") {
      result += "E";
    } else if (manufacturer == "Boeing") {
    } else {
      result += manufacturer + " ";
    }
  }
  if (type) {
    result += type;
  }
  if (variant) {
    if (variant == "neo") {
      result += "neo";
    } else {
      result += `-${variant}`;
    }
  }

  return result;

}

export const getAirportName = (airport: Airport) => {
  return `${airport.name} (${airport.icao_code})`;
};
