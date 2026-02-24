import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import { PlaneTakeoff, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldSet } from "@/components/ui/field";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "react-router-dom";
import { AddRegistration } from "@/components/upload/AddRegistration";
import { AirportAutocomplete } from "@/components/ui/airport-autocomplete";
import type { AddFlightRequest } from "@/types";
import { Textarea } from "@/components/ui/textarea";

export default function AddFlight() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const [formData, setFormData] = useState<AddFlightRequest>({
    registration: "",
    date: new Date().toISOString().split('T')[0],
    dep_airport: "",
    arr_airport: "",
    flight_number: "",
    notes: "",
    airline_code: "",
    aircraft_type_id: "",
    uuid_rh: "",
  });

  useEffect(() => {
    if (id) {
      const fetchFlight = async () => {
        try {
          const res = await api.get(`/flights/${id}`);
          const flight = res.data;
          setFormData({
            registration: flight.RegistrationHistory?.registration || "",
            date: flight.date,
            dep_airport: flight.dep_airport,
            arr_airport: flight.arr_airport,
            flight_number: flight.flight_number,
            notes: flight.notes || "",
            airline_code: flight.airline_code || "",
            aircraft_type_id: flight.RegistrationHistory?.SpecificAircraft?.icao_type || "",
            uuid_rh: flight.uuid_rh || "",
          });
        } catch (err) {
          console.error("Failed to fetch flight", err);
          toast.error("Failed to load flight details");
        }
      };
      fetchFlight();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const checkAirportValidity = async (icao: string) => {
    try {
      const res = await api.get(`/airports?q=${icao}`);
      return res.data && res.data.length > 0 && res.data.some((a: any) => a.icao_code === icao);
    } catch {
      return false;
    }
  };

  const handleFlightNumberBlur = async () => {
    // Only attempt to autofill if we have both an airline and a flight number
    if (formData.airline_code && formData.flight_number) {
      const flightNumberDigits = formData.flight_number.replace(/\D/g, "");
      if (!flightNumberDigits) return;

      setIsAutoFilling(true);
      try {
        const res = await api.get(`/flights/autocomplete?airline=${formData.airline_code}&flight=${flightNumberDigits}`);
        const data = res.data;

        if (data && data.response) {
          const flightData = Array.isArray(data.response) ? data.response[0] : data.response;
          if (flightData) {
            let depValid = true;
            let arrValid = true;

            if (flightData.dep_icao) {
              depValid = await checkAirportValidity(flightData.dep_icao);
            }
            if (flightData.arr_icao) {
              arrValid = await checkAirportValidity(flightData.arr_icao);
            }

            if ((flightData.dep_icao && !depValid) || (flightData.arr_icao && !arrValid)) {
              toast.error(`Autocompleted airport(s) not found in our database. Please contact support.`);
            }

            setFormData(prev => {
              const updates: Partial<AddFlightRequest> = {};
              if (flightData.dep_icao && depValid && !prev.dep_airport) updates.dep_airport = flightData.dep_icao;
              if (flightData.arr_icao && arrValid && !prev.arr_airport) updates.arr_airport = flightData.arr_icao;
              return { ...prev, ...updates };
            });

            if ((flightData.dep_icao && depValid) && (flightData.arr_icao && arrValid)) {
              toast.success("Airports auto-filled from flight number!");
            }
          }
        }
      } catch (error) {
        console.error("Failed to auto-fill airports:", error);
      } finally {
        setIsAutoFilling(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const todayDateStr = new Date().toISOString().split('T')[0];
    if (!id && formData.date === todayDateStr) {
      const confirmed = window.confirm("The flight date is currently set to today. Are you sure you want to log this flight with today's date?");
      if (!confirmed) return;
    }

    // Extract airline code from flight number if possible (fallback)
    let airlineCodeToUse = formData.airline_code;
    if (!airlineCodeToUse && formData.flight_number) {
      const extracted = formData.flight_number.replace(/[0-9]/g, '').trim().toUpperCase();
      if (extracted) {
        airlineCodeToUse = extracted;
      }
    }

    if (!formData.dep_airport || !formData.arr_airport || !airlineCodeToUse || !formData.flight_number || !formData.registration) {
      toast.error("Please fill in all required fields (ensure an aircraft/airline is selected for the flight).");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        airline_code: airlineCodeToUse,
        dep_airport: formData.dep_airport.toUpperCase(),
        arr_airport: formData.arr_airport.toUpperCase(),
        registration: formData.registration.toUpperCase(),
      };

      if (id) {
        await api.put(`/flights/${id}`, payload);
        toast.success("Flight updated successfully!");
      } else {
        await api.post("/flights", payload);
        toast.success("Flight logged successfully!");
      }
      navigate("/flights");
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { error?: string } } };
      toast.error(errorResponse.response?.data?.error || "Failed to log flight.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // We require the aircraft to be fully selected (not just registered) to show the next section
  const isAircraftSelected = Boolean(formData.registration && formData.aircraft_type_id);
  const hasFlightNumber = Boolean(formData.flight_number);
  const hasAirports = Boolean(formData.dep_airport && formData.arr_airport);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link to="/flights">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <PlaneTakeoff className="h-8 w-8 text-primary" />
            {id ? "Edit Flight" : "Log a Flight"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {id ? "Update the details for this flight log." : "Record your commercial flights and automatically link them to aircraft you've spotted."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-card border rounded-xl p-6 shadow-sm">

        {/* 1. Registration */}
        <AddRegistration formData={formData as any} setFormData={setFormData as any} />

        {/* 2. Flight Number & Date */}
        {isAircraftSelected && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 fade-in duration-500'>
            <FieldSet className="flex-1">
              <Field>
                <span className="flex items-center gap-2">
                  {formData.airline_code ? `${formData.airline_code} Flight Number` : "Flight Number"} (e.g. 1234)
                  {isAutoFilling && <Spinner />}
                </span>
              </Field>
              <Input
                required
                name="flight_number"
                placeholder="1234"
                value={formData.flight_number}
                onChange={(e) => {
                  handleChange(e);
                  setIsAutoFilling(true);
                  if (!e.target.value) {
                    setIsAutoFilling(false);
                  }
                }}
                onBlur={handleFlightNumberBlur}
                className="uppercase placeholder:normal-case w-full"
              />
            </FieldSet>

            <FieldSet className="flex-1">
              <Field>Date</Field>
              <Input
                required
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full"
              />
            </FieldSet>
          </div>
        )}

        {/* 4 & 5. Departure & Arrival Airports */}
        {isAircraftSelected && hasFlightNumber && !isAutoFilling && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 fade-in duration-500">
            <FieldSet>
              <Field>Departure Airport (ICAO, e.g. KATL)</Field>
              <AirportAutocomplete
                name="dep_airport"
                placeholder="KATL"
                value={formData.dep_airport}
                onChange={(val) => setFormData(prev => ({ ...prev, dep_airport: val }))}
                required
              />
            </FieldSet>
            <FieldSet>
              <Field>Arrival Airport (ICAO, e.g. KJFK)</Field>
              <AirportAutocomplete
                name="arr_airport"
                placeholder="KJFK"
                value={formData.arr_airport}
                onChange={(val) => setFormData(prev => ({ ...prev, arr_airport: val }))}
                required
              />
            </FieldSet>
          </div>
        )}

        {/* 6. Notes & Submit */}
        {isAircraftSelected && hasFlightNumber && hasAirports && !isAutoFilling && (
          <div className="space-y-8 animate-in slide-in-from-top-4 fade-in duration-500">
            <FieldSet>
              <Field>Notes (Optional)</Field>
              <Textarea name="notes" placeholder="Any special notes about this flight?" value={formData.notes || ""} onChange={handleChange} />
            </FieldSet>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={loading} className="gap-2 w-full md:w-auto shadow-sm">
                {loading ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {loading ? "Saving..." : (id ? "Save Changes" : "Log Flight")}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
