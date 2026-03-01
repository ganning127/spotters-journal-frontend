import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AirlineLogo } from "@/components/AirlineLogo";
import { parseLocalDate } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/api/axios";
import type { UserFlight as Flight } from "@/types";
import tzlookup from 'tz-lookup';
import { formatInTimeZone } from 'date-fns-tz';

interface FlightTableProps {
  flights: Flight[];
  onRefresh: () => void;
}

const getLocalTimeStr = (ts?: string, lat?: number, lon?: number) => {
  if (!ts) return null;
  if (lat && lon) {
    try {
      const tz = tzlookup(lat, lon);
      return formatInTimeZone(ts, tz, 'MMM d, h:mm a');
    } catch {
      return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  }
  return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export function FlightTable({ flights, onRefresh }: FlightTableProps) {
  const navigate = useNavigate();

  const deleteFlight = async (uuid: string) => {
    if (window.confirm("Are you sure you want to delete this flight log? This action cannot be undone.")) {
      try {
        await api.delete(`/flights/${uuid}`);
        toast.success("Flight deleted successfully");
        onRefresh();
      } catch (error) {
        console.error("Failed to delete flight", error);
        toast.error("Failed to delete flight");
      }
    }
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead>Flight</TableHead>
            <TableHead>Departure</TableHead>
            <TableHead>Arrival</TableHead>
            <TableHead className="hidden md:table-cell">Aircraft</TableHead>
            <TableHead className="hidden lg:table-cell">Distance</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flights.map((flight) => (
            <TableRow
              key={flight.uuid_flight}
              className="cursor-pointer group"
              onClick={() => navigate(`/flights/${flight.uuid_flight}`)}
            >
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="text-sm">
                    {parseLocalDate(flight.date).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <AirlineLogo
                    domain={flight.airline?.domain}
                    className="h-8 w-8 min-w-[32px]"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm flex items-center gap-1">
                      {flight.airline_code} {flight.flight_number}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {flight.airline?.name || flight.airline_code}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-base text-foreground">{flight.dep_airport}</span>
                  <span className="text-xs text-muted-foreground" title={flight.dep?.name}>
                    {flight.dep?.name.split(" ").slice(0, 2).join(" ") || "Unknown"}
                  </span>
                  {flight.dep_ts && (
                    <span className="text-xs text-primary mt-1">
                      {getLocalTimeStr(flight.dep_ts, flight.dep?.latitude, flight.dep?.longitude)}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-base text-foreground">{flight.arr_airport}</span>
                  <span className="text-xs text-muted-foreground" title={flight.arr?.name}>
                    {flight.arr?.name.split(" ").slice(0, 2).join(" ") || "Unknown"}
                  </span>
                  {flight.arr_ts && (
                    <span className="text-xs text-primary mt-1">
                      {getLocalTimeStr(flight.arr_ts, flight.arr?.latitude, flight.arr?.longitude)}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {flight.RegistrationHistory?.SpecificAircraft?.AircraftType?.manufacturer} {flight.RegistrationHistory?.SpecificAircraft?.AircraftType?.type}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {flight.RegistrationHistory?.registration}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {flight.distance > 0 ? (
                  <span className="text-sm font-medium">{flight.distance} mi</span>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/flights/edit/${flight.uuid_flight}`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => deleteFlight(flight.uuid_flight)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
