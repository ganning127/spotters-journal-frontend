import { useState } from "react";
import type { Photo } from "@/types";
import { getAircraftName, getAirportName } from "@/util/naming";
import { X, MapPin, Calendar, Edit, Trash, Crop } from "lucide-react";
import { EditPhotoModal } from "./EditPhotoModal";
import { RotatePhotoModal } from "./RotatePhotoModal";
import api from "@/api/axios";
import { toast } from "sonner";

export const PhotoCard = ({ photo, onRefresh }: { photo: Photo; onRefresh?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRotateOpen, setIsRotateOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  return (
    <>
      <RotatePhotoModal
        photo={photo}
        isOpen={isRotateOpen}
        onClose={() => setIsRotateOpen(false)}
        onUpdate={() => {
          if (onRefresh) onRefresh();
        }}
      />
      <EditPhotoModal
        photo={photo}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdate={() => {
          if (onRefresh) onRefresh();
        }}
      />

      {/* 1. The Trigger Card */}
      <div
        className="group relative rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        onClick={() => setIsOpen(true)}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY });
        }}
      >
        {/* Image Container */}
        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
          <img
            src={photo.image_url}
            alt={photo.RegistrationHistory.registration}
            className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Top Right Registration Badge */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-mono tracking-wider px-2 py-1 rounded shadow-sm border border-white/10">
            {photo.RegistrationHistory.registration}
          </div>

          {/* Bottom Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex flex-col text-white">
              <h3 className="font-semibold text-sm tracking-tight text-white/90">
                {getAircraftName(photo, false)}
              </h3>

              <div className="flex items-center gap-3 mt-1 text-[11px] text-white/70 font-medium">
                <div className="flex items-center gap-1">
                  <MapPin size={10} />
                  <span>{photo.Airport.icao_code}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={10} />
                  <span>{new Date(photo.taken_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-[200]"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          />
          <div
            className="fixed z-[201] w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none animate-in fade-in zoom-in-95"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2"
              onClick={() => {
                setContextMenu(null);
                setIsEditOpen(true);
              }}
            >
              <Edit size={14} />
              <span>Edit Details</span>
            </div>
            <div
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2"
              onClick={() => {
                setContextMenu(null);
                setIsRotateOpen(true);
              }}
            >
              <Crop size={14} />
              <span>Edit Photo</span>
            </div>
            <div
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-destructive hover:text-destructive-foreground text-destructive gap-2"
              onClick={async () => {
                setContextMenu(null);
                if (window.confirm("Are you sure you want to delete this photo? This action cannot be undone.")) {
                  try {
                    await api.delete(`/photos/${photo.id}`);
                    toast.success("Photo deleted successfully");
                    if (onRefresh) onRefresh();
                  } catch (error) {
                    console.error("Failed to delete photo", error);
                    toast.error("Failed to delete photo");
                  }
                }
              }}
            >
              <Trash size={14} />
              <span>Delete Photo</span>
            </div>
          </div>
        </>
      )}

      {/* 2. The Fullscreen Overlay */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8 transition-all duration-300 ease-in-out ${isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsOpen(false)}
      >
        {/* Actions Bar */}
        <div className="absolute top-6 right-6 flex items-center gap-2 z-[110]">
          <button
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <X size={24} />
          </button>
        </div>


        <div
          className={`relative max-w-7xl w-full h-full flex flex-col items-center justify-center transition-all duration-500 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={photo.image_url}
            alt={photo.RegistrationHistory.registration}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
          />

          <div className="mt-8 text-center space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {getAircraftName(photo, false)}
            </h2>
            <p className="text-lg text-white/60 font-mono tracking-wide">
              {photo.RegistrationHistory.registration}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-white/40 mt-2">
              <MapPin size={14} />
              <span>{getAirportName(photo.Airport)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
