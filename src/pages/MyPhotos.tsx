import { useEffect, useState } from "react";
import api from "../api/axios";
import type { AirplaneCountsResponse, Photo } from "../types";
import { Button } from "../components/ui/button"; // Assuming you have this
import { Spinner } from "../components/ui/spinner"; // Assuming you have this
import { PhotoCard } from "@/components/PhotoCard";
import { PlayPhotosOverlay } from "@/components/my-photos/PlayPhotosOverlay";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function MyPhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
  });
  const [aircraftTypesFilter, setAircraftTypesFilter] = useState<
    AirplaneCountsResponse[]
  >([]);
  const [selectedAircraftType, setSelectedAircraftType] = useState<string[]>(
    [],
  );
  const [isPlaying, setIsPlaying] = useState(false);

  // Debounce logic: Only update search query after user stops typing for 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchAircraftTypes = async () => {
      try {
        const res = await api.get<AirplaneCountsResponse[]>(
          `/photos/airplane-counts?limit=0`,
        );
        setAircraftTypesFilter(res.data);
      } catch (error) {
        console.error("Failed to fetch aircraft types", error);
      }
    };

    fetchAircraftTypes();
  }, []);

  useEffect(() => {
    setLoading(true);
    // Pass params to backend
    api
      .get<{ data: Photo[]; meta: PaginationMeta }>(`/photos/my-photos`, {
        params: {
          page: page,
          limit: 9,
          search: debouncedSearch,
          aircraftTypeFilter: JSON.stringify(selectedAircraftType),
        },
      })
      .then((res) => {
        setPhotos(res.data.data);
        setMeta(res.data.meta);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, selectedAircraftType]); // Re-run when Page, Search, or Filter changes

  return (
    <div>
      {isPlaying && (
        <PlayPhotosOverlay
          isOpen={isPlaying}
          onClose={() => setIsPlaying(false)}
          search={debouncedSearch}
          selectedAircraftType={selectedAircraftType}
        />
      )}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Collection</h1>
            <p className="text-gray-600 text-sm mt-1">
              You have {meta.total} photos{" "}
              {selectedAircraftType.length > 0 || debouncedSearch.length > 0
                ? "matching your criteria"
                : "total"}
              .
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsPlaying(!isPlaying)}
            className="hover:cursor-pointer"
          >
            {isPlaying ? "Pause Photos" : "Play Photos"}
          </Button>
        </div>

        <div className="relative w-full mt-2">
          <input
            type="text"
            placeholder="Search registration..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 pl-3 border border-gray-300 rounded-lg focus:border-black focus:outline-none"
          />
        </div>

        <div className="flex flex-row gap-1 flex-wrap mt-2">
          {aircraftTypesFilter.map((aircraft) => {
            const isSelected = selectedAircraftType.includes(
              aircraft.airplane_code,
            );
            return (
              <Button
                key={aircraft.airplane_code}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="cursor-pointer"
                onClick={() =>
                  setSelectedAircraftType((prev) => {
                    if (prev.includes(aircraft.airplane_code)) {
                      return prev.filter(
                        (code) => code !== aircraft.airplane_code,
                      );
                    }
                    return [...prev, aircraft.airplane_code];
                  })
                }
              >
                {aircraft.airplane_code} ({aircraft.photo_count})
              </Button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">No photos found.</p>
          {(debouncedSearch || selectedAircraftType.length > 0) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedAircraftType([]);
              }}
              className="text-blue-600 hover:underline text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>

              <span className="text-sm text-gray-600 font-medium">
                Page {meta.page} of {meta.totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
