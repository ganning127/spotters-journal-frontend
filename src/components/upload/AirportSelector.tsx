import api from "@/api/axios";
import type { BasicAirportInfo } from "@/types";
import { useEffect, useState } from "react";

import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";

const LAST_USED_AIRPORT_LOCALSTORAGE_KEY = "lastUsedAirport";
export const AirportSelector = ({
  formData,
  setFormData,
  disableAutoLoad,
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  disableAutoLoad?: boolean;
}) => {
  const [airports, setAirports] = useState<BasicAirportInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BasicAirportInfo | null>(null);

  useEffect(() => {
    if (disableAutoLoad) {
        // If we have an initial value for airport_code, try to fetch its name if not present?
        // For now, trust the parent or let the user search.
        // Actually if airport_code is set, we might want to populate "selected" so it shows as selected.
        // But since we don't have the NAME easily unless passed in, we might need a fetch or just display code.
        // For edit modal, we usually display "ICAO (Name)" if we have it? 
        // In EditPhotoModal, we might not have name readily available unless we passed it.
        // Let's rely on the fact that if formData.airport_code is set, we treat it as selected effectively?
        // Wait, the UI renders "Selected" state if `selected` object is not null.
        if (formData.airport_code && !selected) {
             // We need to fetch details to show "Code (Name)" nicely, or just show code.
             // We'll skip auto-loading from LS, but we might want to "load" the existing airport.
             // Let's purposefully do NOTHING here regarding LS. Default behavior below handles fetching specific airport?
             // No, the below fetch is for SEARCH results based on query.
             
             // If we want to show the currently selected airport nicely, we should probably fetch it one-off or 
             // just let the parent pass the initial name?
             // Let's keep it simple: If disableAutoLoad is true, DO NOT check localStorage.
        }
    } else {
        const lastUsedAirport = localStorage.getItem(
        LAST_USED_AIRPORT_LOCALSTORAGE_KEY,
        );
        if (lastUsedAirport) {
        const parsedAirport = JSON.parse(lastUsedAirport);
        setFormData({
            ...formData,
            airport_code: parsedAirport.icao_code,
        });
        setSelected({
            icao_code: parsedAirport.icao_code,
            name: parsedAirport.name,
        });
        return;
        }
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const airportRes = await api.get<BasicAirportInfo[]>(
          `/airports?q=${formData.airport_code}`,
        );
        setAirports(airportRes.data);
      } catch (err) {
        console.error("Failed to load airports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [formData.airport_code, disableAutoLoad]);

  // Effect to set initial selected state if editing existing airport
  useEffect(() => {
      if (disableAutoLoad && formData.airport_code && !selected && !loading) {
          // This is a bit chicken-and-egg. If we have a code but no name, we might want to fetch it.
          // Or we can rely on the list. 
          // However, for the Edit Modal, we might just want to show it as "Selected" if we can find it?
          // Actually, strict editing: if we have a code, try to find it in the current `airports` list? 
          // No, that list depends on search.
          
          // Better approach: In EditPhotoModal, we should probably look up the airport name from the Photo object 
          // and "pre-seed" the selected state here? 
          // Or we can fetch it here if missing. 
          
          // Let's assume for now the user will see the search input populated with the code, 
          // which is fine. 
          // BUT, to show the "Change" button UI, we need `selected` to be non-null.
          
          // Let's try to fetch the specific airport if we have a code and it's 4 chars (likely valid)
          if (formData.airport_code.length >= 3) {
               api.get<BasicAirportInfo[]>(`/airports?q=${formData.airport_code}`).then(res => {
                   const match = res.data.find(a => a.icao_code === formData.airport_code);
                   if (match) {
                       setSelected(match);
                   }
               }).catch(console.error);
          }
      }
  }, [disableAutoLoad, formData.airport_code]);

  if (selected) {
    return (
      <div className="flex items-center justify-between">
        {selected.icao_code} ({selected.name})
        <Button
          className="cursor-pointer"
          variant="destructive"
          size="sm"
          onClick={() => {
            setFormData({
              ...formData,
              airport_code: "",
            });
            setSelected(null);
            localStorage.removeItem(LAST_USED_AIRPORT_LOCALSTORAGE_KEY);
          }}
        >
          Change
        </Button>
      </div>
    );
  }

  return (
    <>
      {!selected && (
        <Input
          placeholder="ICAO code or airport name"
          value={formData.airport_code}
          onChange={(e) =>
            setFormData({
              ...formData,
              airport_code: e.target.value.toUpperCase(),
            })
          }
        />
      )}

      {loading && <Spinner className="mt-2" />}

      {!loading && airports.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {airports.map((airport) => {
            return (
              <div
                key={airport.icao_code}
                className="p-2 rounded-lg bg-blue-200 hover:bg-blue-300 cursor-pointer"
                onClick={() => {
                  setFormData({
                    ...formData,
                    airport_code: airport.icao_code,
                  });
                  setSelected(airport);
                  localStorage.setItem(
                    LAST_USED_AIRPORT_LOCALSTORAGE_KEY,
                    JSON.stringify({
                      icao_code: airport.icao_code,
                      name: airport.name,
                    }),
                  );
                }}
              >
                {airport.icao_code} ({airport.name})
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
