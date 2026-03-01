import { useState } from "react";
import { cn } from "@/lib/utils";

interface AirlineLogoProps {
  domain?: string;
  className?: string;
}

export function AirlineLogo({ domain, className }: AirlineLogoProps) {
  const [error, setError] = useState(false);

  // Default dimensions if none provided via className
  const hasDimensions = className?.includes("h-") || className?.includes("w-");
  const dimensionClasses = hasDimensions ? "" : "h-10 w-10";

  if (domain && !error) {
    return (
      <img
        src={`https://logos-api.apistemic.com/domain:${domain}`}
        alt={domain}
        className={cn(
          "rounded-full",
          dimensionClasses,
          className
        )}
        onError={() => setError(true)}
      />
    );
  }

  return null;
}
