import { useEffect, useState, useRef } from "react";
import api from "@/api/axios";
import type { BasicAirportInfo } from "@/types";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { X } from "lucide-react";

interface AirportAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
}

export function AirportAutocomplete({
  value,
  onChange,
  placeholder,
  required,
  name,
}: AirportAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<BasicAirportInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If external value changes and we differ (like initialized or reset)
    if (value !== query && !open) {
      setQuery(value);
    }
  }, [value, query, open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        // If the user typed something but didn't click, accept their input
        if (query !== value) {
          onChange(query);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query, value, onChange]);

  useEffect(() => {
    if (!open) return;

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get<BasicAirportInfo[]>(
          `/airports?q=${encodeURIComponent(query)}`,
          {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          }
        ); setResults(res.data);
      } catch (err) {
        console.error("Failed to load airports", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, open]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <Input
          name={name}
          placeholder={placeholder}
          value={query}
          required={required && !value}
          onFocus={() => {
            setOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value.toUpperCase());
            setOpen(true);
          }}
          className="uppercase placeholder:normal-case pr-8"
        />
        {value && (
          <button
            type="button"
            className="absolute right-2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              onChange("");
              setQuery("");
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex justify-center">
              <Spinner className="h-4 w-4" />
            </div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {results.map((airport) => (
                <div
                  key={airport.icao_code}
                  className="px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    onChange(airport.icao_code);
                    setQuery(airport.icao_code);
                    setOpen(false);
                  }}
                >
                  <span className="font-semibold">{airport.icao_code}</span>
                  <span className="text-xs text-muted-foreground truncate ml-4">{airport.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No airports found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
