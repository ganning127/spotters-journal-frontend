import { Calendar, MapPin } from "lucide-react";
import { rectifyFormat, cn } from "@/lib/utils";

export interface Suggestion {
  type_id: string;
  uuid_rh: string;
  airline?: string;
  airline_name?: string;
  Photo: { id: number; taken_at: string; image_url: string; airport_code: string }[];
  SpecificAircraft: {
    icao_type: string;
    manufacturer: string;
    type: string;
    variant: string;
  };
  UserFlight?: {
    uuid_flight: string;
    flight_number: string;
    dep_ts: string;
    arr_ts: string;
    date: string;
    dep_airport: string;
    arr_airport: string;
    airline_code: string;
  }[];
}

export const AircraftInfoDisplay = ({ aircraft, currentTakenAt, editingPhotoId }: { aircraft: Suggestion; currentTakenAt?: string; editingPhotoId?: number }) => {
  const userPhotos = aircraft.Photo || [];

  const isProximate = (photoDate: string) => {
    if (!currentTakenAt) return false;
    try {
      const d1 = new Date(currentTakenAt + (currentTakenAt.endsWith("Z") ? "" : "Z"));
      const d2 = new Date(photoDate); // these dates are not the actual time the photo was taken, but it's fine since we are comparing them with each other

      const diffMs = Math.abs(d1.getTime() - d2.getTime());
      const diffMins = diffMs / (1000 * 60);
      return diffMins <= 30;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div>
        <div className="font-bold">
          {aircraft.SpecificAircraft.manufacturer} {aircraft.SpecificAircraft.type}
          {aircraft.SpecificAircraft.variant
            ? `-${aircraft.SpecificAircraft.variant}`
            : ""}
          {" "}
          ({aircraft.airline_name || aircraft.airline || "Unknown Airline"})
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-0">
        <div className="col-span-2 text-xs text-muted-foreground">
          You have taken {userPhotos.length} {
            userPhotos.length === 1 ? "photo" : "photos"
          } of this aircraft.
        </div>

        {userPhotos.map((photo, index) => {
          const proximate = photo.id !== editingPhotoId && isProximate(photo.taken_at);
          return (
            <div
              key={index}
              className={cn(
                "flex flex-col gap-2 p-2 rounded-lg border transition-colors relative",
                proximate ? "bg-amber-500/10 border-amber-500/50 hover:bg-amber-500/20" : "bg-card/50 hover:bg-card border-border"
              )}
            >
              {proximate && (
                <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10">
                  WITHIN 30M
                </div>
              )}
              <div className="w-full aspect-video rounded-md overflow-hidden border border-border/50 bg-muted relative group">
                <img
                  src={photo.image_url}
                  alt={`Photo from ${photo.taken_at}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between px-1">
                <div className={cn("flex items-center gap-1.5 text-xs", proximate ? "text-amber-600 font-medium" : "text-muted-foreground")}>
                  <Calendar className="w-3.5 h-3.5 opacity-70" />
                  <span>{rectifyFormat(photo.taken_at)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80 bg-secondary/50 px-1.5 py-0.5 rounded-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{photo.airport_code}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {aircraft.UserFlight && aircraft.UserFlight.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground w-full">
          <p className="mb-1">You have flown on this aircraft {aircraft.UserFlight.length} {aircraft.UserFlight.length === 1 ? "time" : "times"}:</p>
          <div className="flex flex-col gap-1 w-full">
            {aircraft.UserFlight.map((flight, index) => (
              <div key={index} className="flex gap-2 justify-between items-center bg-card/50 border border-border p-1.5 rounded text-xs">
                <div className="font-medium text-foreground">{flight.airline_code} {flight.flight_number}</div>
                <div className="text-muted-foreground">
                  <span>{flight.dep_airport} → {flight.arr_airport} ({new Date(flight.date).toDateString()})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
