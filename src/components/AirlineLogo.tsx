import { useState } from "react";
import { cn } from "@/lib/utils";

interface AirlineLogoProps {
    domain?: string;
    fallbackText?: string;
    className?: string;
    textClassName?: string;
}

export function AirlineLogo({ domain, fallbackText, className, textClassName }: AirlineLogoProps) {
    const [error, setError] = useState(false);

    // Default dimensions if none provided via className
    const hasDimensions = className?.includes("h-") || className?.includes("w-");
    const dimensionClasses = hasDimensions ? "" : "h-10 w-10";

    if (domain && !error) {
        return (
            <img
                src={`https://logos-api.apistemic.com/domain:${domain}`}
                alt={fallbackText || "Airline Logo"}
                className={cn(
                    "rounded-full object-contain border bg-white shrink-0 p-0.5",
                    dimensionClasses,
                    className
                )}
                onError={() => setError(true)}
            />
        );
    }

    return (
        <div
            className={cn(
                "rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border shrink-0",
                dimensionClasses,
                className
            )}
        >
            <span className={cn("font-bold text-primary uppercase text-sm", textClassName)}>
                {fallbackText}
            </span>
        </div>
    );
}
