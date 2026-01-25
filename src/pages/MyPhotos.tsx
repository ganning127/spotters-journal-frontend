import { useEffect, useState } from "react";
import api from "../api/axios";
import type { Photo } from "../types";
import { Button } from "../components/ui/button"; // Assuming you have this
import { Spinner } from "../components/ui/spinner"; // Assuming you have this
import { PhotoCard } from "@/components/PhotoCard";
import { AirlineCounts } from "@/components/my-photos/AirlineCounts";
import { AirplaneCounts } from "@/components/my-photos/AirplaneCounts";
import { PhotoCounts } from "@/components/my-photos/PhotoCounts";

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

  // Debounce logic: Only update search query after user stops typing for 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Photos
  useEffect(() => {
    setLoading(true);
    // Pass params to backend
    api
      .get<{ data: Photo[]; meta: PaginationMeta }>(`/photos/my-photos`, {
        params: {
          page: page,
          limit: 9,
          search: debouncedSearch,
        },
      })
      .then((res) => {
        setPhotos(res.data.data);
        setMeta(res.data.meta);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch]); // Re-run when Page or Search changes

  return (
    <div>
      <h1 className="text-3xl font-bold">Statistics</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-8 mb-8">
        <AirlineCounts />
        <AirplaneCounts />
        <PhotoCounts />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">My Collection</h1>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search registration..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 pl-3 border border-gray-300 rounded focus:border-black focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">No photos found.</p>
          {debouncedSearch && (
            <button
              onClick={() => setSearch("")}
              className="text-blue-600 hover:underline text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Photo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>

          {/* Pagination Controls */}
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
