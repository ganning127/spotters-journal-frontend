import { Plane } from "lucide-react";
import { AirportInfo } from "./AirportInfo";

interface FlightInfoCardsProps {
    flight: {
        dep_airport: string;
        dep?: { name: string };
        arr_airport: string;
        arr?: { name: string };
        distance: number;
        notes?: string;
    };
}

export function FlightInfoCards({ flight }: FlightInfoCardsProps) {
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
