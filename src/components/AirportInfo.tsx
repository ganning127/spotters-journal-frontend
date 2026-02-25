import { cn } from "@/lib/utils";

interface AirportInfoProps {
  code: string;
  name: string;
  type: "DEP" | "ARR";
}

export function AirportInfo({ code, name, type }: AirportInfoProps) {
  const isDep = type === "DEP";

  return (
    <div className="flex items-center gap-4">
      {/* 100% Opacity Circle with White Text */}
      <div
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shrink-0 font-bold text-sm shadow-md transition-all border-4 border-background ring-1",
          isDep
            ? "bg-blue-600 text-white ring-blue-600/20"
            : "bg-green-600 text-white ring-green-600/20"
        )}
      >
        {code}
      </div>

      <div className="flex flex-col">
        <span
          className={cn(
            "text-[11px] font-black uppercase tracking-[0.15em] mb-0.5",
            isDep ? "text-blue-600" : "text-green-600"
          )}
        >
        </span>
        <p className="font-medium text-lg leading-tight text-foreground tracking-tight">
          {name || "Unknown Airport"}
        </p>
      </div>
    </div>
  );
}