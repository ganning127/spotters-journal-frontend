import { Plane, Calendar, Hash, Edit, Trash } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { toast } from "sonner";
import { parseLocalDate } from "@/lib/utils";

export interface Flight {
  uuid_flight: string;
  date: string;
  dep_airport: string;
  arr_airport: string;
  flight_number: string;
  airline_code: string;
  distance: number;
  notes: string;
  dep: { icao_code: string; name: string };
  arr: { icao_code: string; name: string };
  airline: { code: string; name: string };
  RegistrationHistory: {
    registration: string;
    SpecificAircraft: {
      icao_type: string;
      AircraftType: { manufacturer: string; type: string; variant: string };
    };
  };
}

interface FlightCardProps {
  flight: Flight;
  onRefresh: () => void;
}

export const FlightCard = ({ flight, onRefresh }: FlightCardProps) => {
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  return (
    <>
      <div
        className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between cursor-pointer"
        onClick={() => navigate(`/flights/${flight.uuid_flight}`)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setContextMenu({ x: e.clientX, y: e.clientY });
        }}
      >
        <div>
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">{flight.airline_code}</span>
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm flex items-center gap-1">
                  <Hash size={14} className="text-muted-foreground" />
                  {flight.airline_code} {flight.flight_number}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={12} />
                  {parseLocalDate(flight.date).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{flight.dep_airport}</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center px-4 relative mt-1">
              <div className="absolute inset-x-4 top-3 border-t border-dashed border-border" />
              <div className="relative bg-card px-2 flex flex-col items-center gap-1 z-10">
                <Plane size={16} className="text-muted-foreground" />
                {flight.distance > 0 && (
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {flight.distance} mi
                  </span>
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{flight.arr_airport}</p>
            </div>
          </div>

          <div className="space-y-2 mt-4 text-sm bg-muted/30 p-3 rounded-lg border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aircraft</span>
              <span className="font-medium text-right">
                {flight.RegistrationHistory?.SpecificAircraft?.AircraftType?.manufacturer} {flight.RegistrationHistory?.SpecificAircraft?.AircraftType?.type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registration</span>
              <span className="font-medium">{flight.RegistrationHistory?.registration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu Overlay */}
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
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground gap-2"
              onClick={() => {
                navigate(`/flights/edit/${flight.uuid_flight}`);
                setContextMenu(null);
              }}
            >
              <Edit size={14} />
              <span>Edit Flight</span>
            </div>
            <div
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-destructive hover:text-destructive-foreground text-destructive gap-2"
              onClick={async () => {
                setContextMenu(null);
                if (window.confirm("Are you sure you want to delete this flight log? This action cannot be undone.")) {
                  try {
                    await api.delete(`/flights/${flight.uuid_flight}`);
                    toast.success("Flight deleted successfully");
                    onRefresh();
                  } catch (error) {
                    console.error("Failed to delete flight", error);
                    toast.error("Failed to delete flight");
                  }
                }
              }}
            >
              <Trash size={14} />
              <span>Delete Flight</span>
            </div>
          </div>
        </>
      )}
    </>
  );
};
