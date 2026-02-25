import { Plane } from "lucide-react";
import { AirportInfo } from "./AirportInfo";
import tzlookup from 'tz-lookup';
import { formatInTimeZone } from 'date-fns-tz';

interface FlightInfoCardsProps {
    flight: {
        dep_airport: string;
        dep?: { name: string; latitude?: number; longitude?: number };
        arr_airport: string;
        arr?: { name: string; latitude?: number; longitude?: number };
        distance: number;
        notes?: string;
        dep_ts?: string;
        arr_ts?: string;
    };
}

export function FlightInfoCards({ flight }: FlightInfoCardsProps) {
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
        <div className="bg-card border rounded-2xl p-8 flex flex-col h-fit justify-between shadow-sm">
            <div className="relative space-y-10">
                <div className="absolute left-[28px] top-0 bottom-0 w-0 border-l-2 border-dashed border-muted-foreground/30 z-0" />
                <div className="relative z-10 bg-card">
                    <AirportInfo
                        type="DEP"
                        code={flight.dep_airport}
                        name={flight.dep?.name || ""}
                    />
                    {flight.dep_ts && (
                        <p className="mt-2 ml-[72px] text-sm font-semibold text-muted-foreground tracking-wide">
                            {depTimeStr}
                        </p>
                    )}
                </div>

                <div className="relative z-10 flex items-center" style={{ paddingLeft: '11px' }}>
                    <div className="inline-flex items-center gap-2 bg-background px-3 py-1.5 rounded-full border shadow-sm">
                        <Plane className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-foreground">
                            {flight.distance} mi
                        </span>
                    </div>
                </div>

                <div className="relative z-10 bg-card">
                    <AirportInfo
                        type="ARR"
                        code={flight.arr_airport}
                        name={flight.arr?.name || ""}
                    />
                    {flight.arr_ts && (
                        <p className="mt-2 ml-[72px] text-sm font-semibold text-muted-foreground tracking-wide">
                            {arrTimeStr}
                        </p>
                    )}
                </div>
            </div>

            {/* Notes Section */}
            {flight.notes && (
                <div className="mt-10 pt-6 border-t border-dashed border-muted-foreground/20">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-black mb-3">
                        Flight Log Notes
                    </p>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                        "{flight.notes}"
                    </p>
                </div>
            )}
        </div>
    );
}
