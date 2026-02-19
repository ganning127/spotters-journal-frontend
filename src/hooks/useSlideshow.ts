import { useState, useRef, useEffect, useCallback } from "react";
import type { Photo } from "@/types";
import api from "@/api/axios";

interface UseSlideshowProps {
  initialIntervalMs?: number;
  search?: string;
  selectedAircraftType?: string[];
  isOpen: boolean;
}

export function useSlideshow({
  initialIntervalMs = 30_000,
  search = "",
  selectedAircraftType = [],
  isOpen,
}: UseSlideshowProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(isOpen);
  const [isPlaying, setIsPlaying] = useState(true);
  const [intervalMs, setIntervalMs] = useState(initialIntervalMs);

  // Refs for tracking async state
  const isFetchingRef = useRef(false);
  const newPhotosRef = useRef<Photo[]>([]);
  const currentIndexRef = useRef(currentIndex);

  // Update ref when state changes
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const fetchPhotos = useCallback(
    async (forInitialLoad: boolean) => {
      try {
        if (isFetchingRef.current) return;
        
        if (forInitialLoad) {
          setIsLoading(true);
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
          setCurrentIndex(0);
          setIsLoading(false);
        } else {
          newPhotosRef.current = res.data.data;
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load slideshow photos", err);
        setIsLoading(false);
      } finally {
        isFetchingRef.current = false;
      }
    },
    [search, selectedAircraftType],
  );

  // Initial Load
  useEffect(() => {
    if (isOpen) {
      setPhotos([]);
      newPhotosRef.current = [];
      fetchPhotos(true);
      setIsPlaying(true);
    }
  }, [isOpen, fetchPhotos]);

  // Handle Play/Pause Interval
  useEffect(() => {
    if (!isPlaying || !isOpen || photos.length === 0) return;

    const interval = setInterval(() => {
      // Check if we need to load more photos
      // Re-fill buffer if we're near the end
      if (
        currentIndexRef.current >= photos.length - 2 &&
        !isFetchingRef.current &&
        newPhotosRef.current.length === 0
      ) {
        fetchPhotos(false);
      }
      
      handleNext();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, isOpen, photos.length, intervalMs, fetchPhotos]);

  const handleNext = () => {
    setCurrentIndex((prev) => {
      // If we are at the end...
      if (prev >= photos.length - 1) {
        // If we have new photos, append them and continue
        if (newPhotosRef.current.length > 0) {
            setPhotos((currentPhotos) => [...currentPhotos, ...newPhotosRef.current]);
            newPhotosRef.current = [];
            return prev + 1; 
        }
        // If no new photos yet, verify logic (loop or wait). 
        // For infinite stream, we might loop back to 0 if buffer failed.
        // But ideally we just append. If buffer empty, loop to 0.
        return 0; 
      }
      return prev + 1;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => {
        if (prev === 0) return photos.length - 1;
        return prev - 1;
    });
  };

  const togglePlay = () => setIsPlaying((prev) => !prev);

  return {
    photos,
    currentPhoto: photos[currentIndex],
    currentIndex,
    isLoading,
    isPlaying,
    togglePlay,
    handleNext,
    handlePrev,
    setIntervalMs,
    intervalMs
  };
}
