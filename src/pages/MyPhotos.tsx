import { useEffect, useState } from "react";
import api from "../api/axios";
import type { AirplaneCountsResponse, Photo } from "../types";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";
import { PhotoCard } from "@/components/PhotoCard";
import { SimplePhotosOverlay } from "@/components/my-photos/SimplePhotosOverlay";
import { Search, Plane, XCircle, PlayCircle, PauseCircle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const generatePageNumbers = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

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
  const [lastRefresh, setLastRefresh] = useState(0);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchAircraftTypes = async () => {
      try {
        const res = await api.get<AirplaneCountsResponse[]>(
          `/photos/airplane-counts?limit=1000`,
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
  }, [page, debouncedSearch, selectedAircraftType, lastRefresh]);

  return (
    <div className="space-y-8">
      {isPlaying && (
        <SimplePhotosOverlay
          isOpen={isPlaying}
          onClose={() => setIsPlaying(false)}
          search={debouncedSearch}
          selectedAircraftType={selectedAircraftType}
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Collection</h1>
          <p className="text-muted-foreground mt-1">
            {meta.total} {meta.total === 1 ? 'photo' : 'photos'} in your personal fleet.
          </p>
        </div>

        <Button
          variant={isPlaying ? "destructive" : "default"}
          onClick={() => setIsPlaying(!isPlaying)}
          className="gap-2 shadow-sm transition-all hover:scale-105"
        >
          {isPlaying ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
          {isPlaying ? "Pause Slideshow" : "Start Slideshow"}
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-card border rounded-xl p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by registration (e.g., N12345)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          />
        </div>

        {aircraftTypesFilter.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Filter size={12} />
              <span>Filter by Aircraft Type</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {aircraftTypesFilter.map((aircraft) => {
                const isSelected = selectedAircraftType.includes(
                  aircraft.airplane_code,
                );
                return (
                  <button
                    key={aircraft.airplane_code}
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
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:bg-muted"
                    )}
                  >
                    {aircraft.airplane_code}
                    <span className={cn("ml-0.5 opacity-60", isSelected ? "text-primary-foreground" : "")}>
                      {aircraft.photo_count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 animate-pulse">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading specific aircraft data...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-xl border border-dashed animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No photos found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
            We couldn't find any photos matching your current filters or search query.
          </p>
          {(debouncedSearch || selectedAircraftType.length > 0) && (
            <Button
              variant="link"
              onClick={() => {
                setSearch("");
                setSelectedAircraftType([]);
              }}
              className="mt-4 text-primary gap-2"
            >
              <XCircle size={16} />
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
              >
                <PhotoCard
                  photo={photo}
                  onRefresh={() => {
                    setLastRefresh(Date.now());
                  }}
                />
              </div>
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 sm:gap-2 pt-8 border-t flex-wrap">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 shrink-0 cursor-pointer"
              >
                &lt;
              </Button>

              {generatePageNumbers(page, meta.totalPages).map((p, i) => (
                <Button
                  key={i}
                  variant={p === page ? "default" : "outline"}
                  size={p === "..." ? "sm" : "icon"}
                  onClick={() => p !== "..." && setPage(p as number)}
                  disabled={p === "..."}
                  className={cn(
                    "w-10 h-10 shrink-0 cursor-pointer",
                    p === "..." && "border-none shadow-none cursor-default bg-transparent text-foreground hover:bg-transparent"
                  )}
                >
                  {p}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="w-10 h-10 shrink-0 cursor-pointer"
              >
                &gt;
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
