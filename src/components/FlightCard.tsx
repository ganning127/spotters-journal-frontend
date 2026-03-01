import { Plane, Calendar, Hash, Edit, Trash } from "lucide-react";
import { AirlineLogo } from "./AirlineLogo";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { toast } from "sonner";
import { parseLocalDate } from "@/lib/utils";
import tzlookup from 'tz-lookup';
import { formatInTimeZone } from 'date-fns-tz';

import type { UserFlight as Flight } from "@/types";

interface FlightCardProps {
  flight: Flight;
  onRefresh: () => void;
}

export const FlightCard = ({ flight, onRefresh }: FlightCardProps) => {
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  let depTimeStr = "";
  if (flight.dep_ts && flight.dep?.latitude && flight.dep?.longitude) {
    try {
      const tz = tzlookup(flight.dep.latitude, flight.dep.longitude);
      depTimeStr = formatInTimeZone(flight.dep_ts, tz, 'h:mm a');
    } catch {
      depTimeStr = new Date(flight.dep_ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } else if (flight.dep_ts) {
    depTimeStr = new Date(flight.dep_ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  let arrTimeStr = "";
  if (flight.arr_ts && flight.arr?.latitude && flight.arr?.longitude) {
    try {
      const tz = tzlookup(flight.arr.latitude, flight.arr.longitude);
      arrTimeStr = formatInTimeZone(flight.arr_ts, tz, 'h:mm a');
    } catch {
      arrTimeStr = new Date(flight.arr_ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } else if (flight.arr_ts) {
    arrTimeStr = new Date(flight.arr_ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

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
          <div className="flex items-center gap-2 mb-4 pb-4 border-b">
            <AirlineLogo
              domain={flight.airline?.domain}
              fallbackText={flight.airline_code}
            />
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
            {flight.dep_ts && (
              <p className="text-xs font-semibold text-muted-foreground mt-1 tracking-wide">
                {depTimeStr}
              </p>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center justify-center px-4 relative mt-1">
            <div className="absolute inset-x-4 top-3 border-t border-dashed border-border" />
            <div className="relative bg-card px-2 flex flex-col items-center gap-1 z-10">
              <Plane size={16} className="text-muted-foreground" />
              {flight.distance !== undefined && flight.distance > 0 && (
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {flight.distance} mi
                </span>
              )}
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{flight.arr_airport}</p>
            {flight.arr_ts && (
              <p className="text-xs font-semibold text-muted-foreground mt-1 tracking-wide">
                {arrTimeStr}
              </p>
            )}
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

      {/* Context Menu Overlay */}
      {
        contextMenu && (
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
        )
      }
    </>
  );
};
