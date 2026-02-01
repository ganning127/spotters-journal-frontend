import { useEffect, useState, useRef, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import type { Photo } from "@/types";
import api from "@/api/axios";
import { getAircraftName, getAirportName } from "@/util/naming";

interface SimplePhotosOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  search?: string;
  selectedAircraftType?: string[];
  intervalMs?: number;
}

export function SimplePhotosOverlay({
  isOpen,
  onClose,
  search = "",
  selectedAircraftType = [],
  intervalMs = 30_000,
}: SimplePhotosOverlayProps) {
  // hangs on the last photo forever if no new photos are fetched
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [newPhotos, setNewPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const isFetchingRef = useRef(false);

  // Refs for accessing state inside intervals/listeners
  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const fetchPhotos = useCallback(
    async (forInitialLoad: boolean) => {
      try {
        if (forInitialLoad) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        isFetchingRef.current = true;
        const res = await api.get<{ data: Photo[] }>(
          "/photos/my-photos/random",
          {
            params: {
              search: search,
              aircraftTypeFilter: JSON.stringify(selectedAircraftType),
            },
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
              Pragma: "no-cache",
              Expires: "0",
            },
          },
        );

        if (forInitialLoad) {
          setPhotos(res.data.data);
        } else {
          setNewPhotos(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load slideshow photos", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [search, selectedAircraftType],
  );

  useEffect(() => {
    console.log("mounting...");
    if (!isOpen) return;

    fetchPhotos(true);

    const interval = setInterval(() => {
      // hold here while fetching new photos
      if (isFetchingRef.current) return;

      if (currentIndexRef.current + 1 >= photos.length) {
        // fetch new photos if available
        fetchPhotos(false);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isOpen, fetchPhotos, intervalMs, photos.length]);

  useEffect(() => {
    console.log("newPhotos changed:", newPhotos.length);
    if (newPhotos.length === 0) return;
    setPhotos(newPhotos);
    setNewPhotos([]);
  }, [currentIndex, newPhotos]);

  useEffect(() => {
    console.log("photos changed:", photos.length);
    if (photos.length === 0) return;
    setCurrentIndex(0);
  }, [photos]);

  // 2. Fullscreen & Keyboard Handlers
  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn("Could not enter fullscreen mode:", err);
      });
    } else if (!isOpen && document.fullscreenElement) {
      document.exitFullscreen().catch(console.warn);
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isOpen) onClose();
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const photo = photos[currentIndex];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-in fade-in duration-300"
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all z-10"
      >
        <X size={32} />
        <span className="sr-only">Close</span>
      </button>

      {loading ? (
        <div className="flex flex-col items-center text-white/80">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          <p className="text-lg">Loading photos player...</p>
        </div>
      ) : !photo ? (
        <div className="text-white/80 text-center px-4">
          <p className="text-xl mb-2">No photos found.</p>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <img
            // Using ID as key ensures React handles the DOM transition correctly
            key={photo.id}
            src={photo.image_url}
            alt={photo.registration}
            className="max-h-full max-w-full object-contain shadow-2xl"
          />
          <div className="absolute w-4xl bottom-10 bg-black/50 text-white px-4 py-4 rounded-lg backdrop-blur-sm">
            <div className="flex flex-row justify-between items-start">
              <div>
                <p className="text-2xl font-semibold">
                  {getAircraftName(photo, false)}
                </p>
                <p className="mt-1 text-gray-300 text-lg">
                  {photo.registration}{" "}
                </p>
              </div>

              <div>
                <p className="text-2xl">{getAirportName(photo.Airport)}</p>
                <p className="mt-2 text-lg text-gray-300 text-end">
                  Taken on {new Date(photo.taken_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
