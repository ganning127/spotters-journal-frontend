import { useEffect, useRef, useState } from "react";
import {
  X,
  Loader2
} from "lucide-react";
import { getAircraftName, getAirportName } from "@/util/naming";
import { useSlideshow } from "@/hooks/useSlideshow";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SimplePhotosOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  search?: string;
  selectedAircraftType?: string[];
  airlineFilter?: string[];
  intervalMs?: number;
}

export function SimplePhotosOverlay({
  isOpen,
  onClose,
  search = "",
  selectedAircraftType = [],
  airlineFilter = [],
  intervalMs = 30_000,
}: SimplePhotosOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(false);
  const hideControlsTimer = useRef<NodeJS.Timeout>(null);

  const {
    currentPhoto,
    isLoading,
    isPlaying,
    togglePlay,
    handleNext,
    handlePrev,
  } = useSlideshow({
    isOpen,
    search,
    selectedAircraftType,
    airlineFilter,
    initialIntervalMs: intervalMs,
  });

  // 1. Fullscreen & Keyboard Handlers
  useEffect(() => {
    if (isOpen && containerRef.current && !document.fullscreenElement) {
      if (typeof containerRef.current.requestFullscreen === 'function') {
        containerRef.current.requestFullscreen().catch(console.warn);
      } else if (typeof (containerRef.current as any).webkitRequestFullscreen === 'function') {
        (containerRef.current as any).webkitRequestFullscreen();
      }
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && (document as any).webkitFullscreenElement === undefined && isOpen) {
        onClose();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [isOpen, onClose]);

  // Key press handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, togglePlay, onClose]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-in fade-in duration-300"
      onMouseMove={handleMouseMove}
      onClick={() => {
        setShowControls(true);
      }}
    >
      {/* Loading State */}
      {isLoading && !currentPhoto && (
        <div className="flex flex-col items-center text-white/80 z-20">
          <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
          <p className="text-xl font-light tracking-wide">Curating your slideshow...</p>
        </div>
      )}

      {/* No Photos State */}
      {!isLoading && !currentPhoto && (
        <div className="text-white/80 text-center px-4 z-20">
          <p className="text-2xl mb-2 font-light">No photos found.</p>
          <p className="text-lg opacity-70">Try adjusting your filters.</p>
          <Button onClick={onClose} variant="outline" className="mt-6">
            Close Player
          </Button>
        </div>
      )}

      {/* Main Image */}
      {currentPhoto && (
        <>
          <div className="absolute inset-0 flex items-center justify-center bg-black transition-opacity duration-500">
            {/* Background Blur Effect */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110"
              style={{ backgroundImage: `url(${currentPhoto.image_url})` }}
            />

            <img
              key={currentPhoto.id}
              src={currentPhoto.image_url}
              alt={currentPhoto.RegistrationHistory.registration}
              className="relative max-h-screen max-w-full object-contain shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-700"
            />
          </div>

          {/* Top Bar (Close) */}
          <div className={cn(
            "absolute top-0 left-0 right-0 p-6 flex justify-end z-30 transition-opacity duration-300 bg-gradient-to-b from-black/60 to-transparent",
            showControls ? "opacity-100" : "opacity-0"
          )}>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
            >
              <X size={32} />
            </button>
          </div>

          {/* Bottom Controls & Info */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-8 z-30 transition-all duration-500 bg-gradient-to-t from-black/90 via-black/50 to-transparent",
            "translate-y-0 opacity-100"
          )}>
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
              {/* Info Section */}
              <div className="flex-1 text-left space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-white tracking-tight">
                    {clientName(currentPhoto)}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-white/20 text-white/90 border border-white/10">
                    {currentPhoto.RegistrationHistory.registration}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-lg">
                  <span className="font-bold text-white/90">{getAircraftName(currentPhoto, false)}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/70">{getAirportName(currentPhoto.Airport)}</span>
                </div>
              </div>

              {/* Right Side: Date */}
              <div className="text-right">
                <div className="text-white/60 font-light text-lg">
                  {new Date(currentPhoto.taken_at).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper to reliably get airline name or fallback
function clientName(photo: any) {
  if (photo.RegistrationHistory.airline) return photo.RegistrationHistory.airline;
  return "Private / Unknown";
}
