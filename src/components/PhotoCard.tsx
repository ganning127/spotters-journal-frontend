import { useState } from "react";
import type { Airport, Photo } from "@/types";

export const PhotoCard = ({ photo }: { photo: Photo }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 1. The Trigger Card */}
      <div className="group border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md bg-white">
        <div className="aspect-w-4 aspect-h-3 bg-gray-200 relative">
          <img
            onClick={() => setIsOpen(true)}
            src={photo.image_url}
            alt={photo.SpecificAircraft.registration}
            className="object-cover w-full h-64 cursor-pointer"
          />
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            {photo.SpecificAircraft.registration}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1">{getAircraftName(photo)}</h3>
          <p className="text-sm text-gray-500 mb-3">
            {photo.Airport.name} ({photo.Airport.icao_code})
          </p>
          <div className="border-t pt-3 flex justify-between items-center text-xs text-gray-400">
            <span>{new Date(photo.taken_at).toLocaleDateString()}</span>
            {photo.camera_model && <span>{photo.camera_model}</span>}
          </div>
        </div>
      </div>

      {/* 2. The Fullscreen Overlay (Always in DOM) */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 transition-all duration-200 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      >
        {/* Close Button */}
        <button
          className="hover:cursor-pointer absolute top-6 right-6 text-white text-4xl hover:text-gray-300 z-[60]"
          onClick={() => setIsOpen(false)}
        >
          &times;
        </button>

        <div
          className={`relative max-w-7xl max-h-full transition-transform duration-300 ${
            isOpen ? "scale-100" : "scale-95"
          }`}
        >
          <img
            src={photo.image_url}
            alt={photo.SpecificAircraft.registration}
            className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            loading="lazy"
          />

          <div className="mt-4 text-white text-center">
            <p className="font-semibold text-lg">{getAircraftName(photo)}</p>
            <p className="text-sm text-gray-400">
              {photo.SpecificAircraft.registration}
            </p>
            <p className="text-sm text-gray-400">
              {getAirportName(photo.Airport)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const getAircraftName = (photo: Photo) => {
  const manufacturer = photo.SpecificAircraft.AircraftType.manufacturer;
  const type = photo.SpecificAircraft.AircraftType.type;
  const variant = photo.SpecificAircraft.AircraftType.variant;

  let result = "";
  if (manufacturer) {
    result += manufacturer[0].toUpperCase();
  }
  if (type) {
    result += type;
  }
  if (variant) {
    if (variant == "NEO") {
      result += variant[0];
    } else {
      result += `-${variant}`;
    }
  }

  return result;
};

const getAirportName = (airport: Airport) => {
  return `${airport.name} (${airport.icao_code})`;
};
