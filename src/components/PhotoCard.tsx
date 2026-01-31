import { useState } from "react";
import type { Photo } from "@/types";
import { getAircraftName, getAirportName } from "@/util/naming";

export const PhotoCard = ({ photo }: { photo: Photo }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 1. The Trigger Card */}
      <div className="group relative border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md bg-white">
        {/* Image Container */}
        <div className="aspect-w-4 aspect-h-3 relative">
          <img
            onClick={() => setIsOpen(true)}
            src={photo.image_url}
            alt={photo.registration}
            className="object-cover w-full h-64 cursor-pointer"
          />

          {/* Top Right Registration Badge */}
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            {photo.registration}
          </div>

          {/* Bottom Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
            <div className="flex flex-row justify-between items-center text-white">
              <h3 className="text-sm md:hidden">
                {getAircraftName(photo, true)}
              </h3>
              <h3 className="text-sm md:block hidden">
                {getAircraftName(photo, false)}
              </h3>

              <p className="text-xs opacity-90">
                <span className="hidden md:contents">
                  {photo.Airport.icao_code} •{" "}
                </span>
                <span>{new Date(photo.taken_at).toLocaleDateString()}</span>
              </p>
            </div>
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
            alt={photo.registration}
            className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            loading="lazy"
          />

          <div className="mt-4 text-white text-center">
            <p className="font-semibold text-lg">
              {getAircraftName(photo, false)}
            </p>
            <p className="text-sm text-gray-400">{photo.registration}</p>
            <p className="text-sm text-gray-400">
              {getAirportName(photo.Airport)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
