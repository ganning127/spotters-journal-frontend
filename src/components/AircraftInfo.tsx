import { Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PhotoCard } from "@/components/PhotoCard";
import { getAircraftNameFromFields } from "@/util/naming";
import type { Photo, RegistrationHistory } from "@/types";

interface AircraftInfoProps {
  registrationHistory: RegistrationHistory;
  photos: Photo[];
}

export function AircraftInfo({ registrationHistory, photos }: AircraftInfoProps) {
  const rh = registrationHistory;
  const ac = rh.SpecificAircraft?.AircraftType || {};

  return (
    <div className="max-w-7xl mx-auto pt-12 px-4 space-y-5">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Camera className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {rh.registration} ({getAircraftNameFromFields(ac.manufacturer, ac.type, ac.variant)})
            </h2>
          </div>
        </div>

        {photos.length > 0 && (
          <Link to={`/upload?registration=${rh.registration}`}>
            <Button variant="default" className="rounded-full gap-2 shadow-sm hover:shadow-md transition-all">
              <Camera className="h-4 w-4" />
              Add Photo
            </Button>
          </Link>
        )}
      </div>

      {/* Sightings Area */}
      <div className="pt-2">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/30 border-2 border-dashed rounded-3xl transition-colors hover:bg-muted/50">
            <div className="p-4 bg-background rounded-full shadow-sm mb-4">
              <Camera className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-semibold text-lg">No sightings yet.</p>
            <p className="text-muted-foreground/70 mb-6">Add your first photo of this aircraft.</p>
            <Link to={`/upload?registration=${rh.registration}`}>
              <Button variant="outline" className="rounded-full px-10 border-primary/20 hover:border-primary">
                Upload First Photo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {photos.map(photo => (
              <div key={photo.id} className="group">
                <PhotoCard photo={photo} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
