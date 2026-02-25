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
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import tzlookup from 'tz-lookup';

export default function AddFlight() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const [depZone, setDepZone] = useState<string | null>(null);
  const [arrZone, setArrZone] = useState<string | null>(null);
  const [depLocalTime, setDepLocalTime] = useState<string>("");
  const [arrLocalTime, setArrLocalTime] = useState<string>("");
  const [prevDepAirport, setPrevDepAirport] = useState<string>("");
  const [prevArrAirport, setPrevArrAirport] = useState<string>("");

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
    dep_ts: "",
    arr_ts: "",
  });

  useEffect(() => {
    if (id) {
      const fetchFlight = async () => {
        try {
          const res = await api.get(`/flights/${id}`);
          const flight = res.data;

          let dZoneStr = null;
          let aZoneStr = null;
          if (flight.dep_airport) {
            setPrevDepAirport(flight.dep_airport);
            try { const r = await api.get(`/airports/${flight.dep_airport}`); if (r.data.latitude && r.data.longitude) { dZoneStr = tzlookup(r.data.latitude, r.data.longitude); setDepZone(dZoneStr); } } catch { }
          }
          if (flight.arr_airport) {
            setPrevArrAirport(flight.arr_airport);
            try { const r = await api.get(`/airports/${flight.arr_airport}`); if (r.data.latitude && r.data.longitude) { aZoneStr = tzlookup(r.data.latitude, r.data.longitude); setArrZone(aZoneStr); } } catch { }
          }

          if (flight.dep_ts && dZoneStr) setDepLocalTime(formatInTimeZone(flight.dep_ts, dZoneStr, "yyyy-MM-dd'T'HH:mm"));
          if (flight.arr_ts && aZoneStr) setArrLocalTime(formatInTimeZone(flight.arr_ts, aZoneStr, "yyyy-MM-dd'T'HH:mm"));

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
            dep_ts: flight.dep_ts || "",
            arr_ts: flight.arr_ts || "",
          });
        } catch (err) {
          console.error("Failed to fetch flight", err);
          toast.error("Failed to load flight details");
        }
      };
      fetchFlight();
    }
  }, [id]);

  useEffect(() => {
    if (formData.dep_airport && formData.dep_airport !== prevDepAirport) {
      if (prevDepAirport && depLocalTime) {
        toast.warning(`Departure changed to ${formData.dep_airport}. Please verify your departure time for the new timezone.`);
      }
      setPrevDepAirport(formData.dep_airport);
    }
  }, [formData.dep_airport, prevDepAirport, depLocalTime]);

  useEffect(() => {
    if (formData.arr_airport && formData.arr_airport !== prevArrAirport) {
      if (prevArrAirport && arrLocalTime) {
        toast.warning(`Arrival changed to ${formData.arr_airport}. Please verify your arrival time for the new timezone.`);
      }
      setPrevArrAirport(formData.arr_airport);
    }
  }, [formData.arr_airport, prevArrAirport, arrLocalTime]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const checkAirportInfo = async (icao: string) => {
    try {
      const res = await api.get(`/airports?q=${icao}`);
      return res.data?.find((a: any) => a.icao_code === icao);
    } catch {
      return null;
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
            let depInfo = null;
            let arrInfo = null;

            if (flightData.dep_icao) {
              depInfo = await checkAirportInfo(flightData.dep_icao);
            }
            if (flightData.arr_icao) {
              arrInfo = await checkAirportInfo(flightData.arr_icao);
            }

            if ((flightData.dep_icao && !depInfo) || (flightData.arr_icao && !arrInfo)) {
              toast.error(`Autocompleted airport(s) not found in our database. Please contact support.`);
            }

            setFormData(prev => {
              const updates: Partial<AddFlightRequest> = {};
              if (flightData.dep_icao && depInfo && !prev.dep_airport) updates.dep_airport = flightData.dep_icao;
              if (flightData.arr_icao && arrInfo && !prev.arr_airport) updates.arr_airport = flightData.arr_icao;
              return { ...prev, ...updates };
            });

            if (depInfo?.latitude && depInfo?.longitude) {
              setDepZone(tzlookup(depInfo.latitude, depInfo.longitude));
            }
            if (arrInfo?.latitude && arrInfo?.longitude) {
              setArrZone(tzlookup(arrInfo.latitude, arrInfo.longitude));
            }

            if ((flightData.dep_icao && depInfo) && (flightData.arr_icao && arrInfo)) {
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

    // Extract airline code from flight number if possible (fallback)
    let airlineCodeToUse = formData.airline_code;
    if (!airlineCodeToUse && formData.flight_number) {
      const extracted = formData.flight_number.replace(/[0-9]/g, '').trim().toUpperCase();
      if (extracted) {
        airlineCodeToUse = extracted;
      }
    }

    if (!formData.dep_airport || !formData.arr_airport || !airlineCodeToUse || !formData.flight_number || !formData.registration || !depLocalTime || !arrLocalTime) {
      toast.error("Please fill in all required fields (ensure an aircraft/airline and times are selected for the flight).");
      return;
    }

    setLoading(true);

    let finalDepTs = formData.dep_ts;
    let finalArrTs = formData.arr_ts;

    try {
      if (depLocalTime && depZone) {
        finalDepTs = fromZonedTime(depLocalTime, depZone).toISOString();
      }
      if (arrLocalTime && arrZone) {
        finalArrTs = fromZonedTime(arrLocalTime, arrZone).toISOString();
      }
    } catch (e) {
      toast.error("Invalid time entered");
      setLoading(false);
      return;
    }

    const localDateStr = depLocalTime ? depLocalTime.split('T')[0] : formData.date;
    try {
      const payload = {
        ...formData,
        date: localDateStr,
        dep_ts: finalDepTs,
        arr_ts: finalArrTs,
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

  const handleDateChange = (type: "dep" | "arr", newDate: string) => {
    if (type === "dep") {
      const time = depLocalTime ? (depLocalTime.split('T')[1] || "") : "";
      setDepLocalTime(time ? `${newDate}T${time}` : newDate);

      const arrTime = arrLocalTime ? (arrLocalTime.split('T')[1] || "") : "";
      setArrLocalTime(arrTime ? `${newDate}T${arrTime}` : newDate);
    } else {
      const time = arrLocalTime ? (arrLocalTime.split('T')[1] || "") : "";
      setArrLocalTime(time ? `${newDate}T${time}` : newDate);
    }
  };

  const handleTimeChange = (type: "dep" | "arr", newTime: string) => {
    if (type === "dep") {
      const date = depLocalTime ? depLocalTime.split('T')[0] : formData.date;
      setDepLocalTime(`${date}T${newTime}`);
    } else {
      const date = arrLocalTime ? arrLocalTime.split('T')[0] : (depLocalTime ? depLocalTime.split('T')[0] : formData.date);
      setArrLocalTime(`${date}T${newTime}`);
    }
  };

  const getDatePart = (datetime: string) => datetime ? datetime.split('T')[0] : "";
  const getTimePart = (datetime: string) => datetime ? (datetime.split('T')[1] || "") : "";

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
          <div className='animate-in slide-in-from-top-4 fade-in duration-500'>
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
          </div>
        )}

        {/* 3 & 4. Departure & Arrival Airports */}
        {isAircraftSelected && hasFlightNumber && !isAutoFilling && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 fade-in duration-500">
            <FieldSet>
              <Field>Departure Airport (ICAO, e.g. KATL)</Field>
              <AirportAutocomplete
                name="dep_airport"
                placeholder="KATL"
                value={formData.dep_airport}
                onChange={(val, airport) => {
                  setFormData(prev => ({ ...prev, dep_airport: val }));
                  if (airport?.latitude && airport?.longitude) {
                    setDepZone(tzlookup(airport.latitude, airport.longitude));
                  } else if (val) {
                    api.get(`/airports/${val}`).then(r => { if (r.data.latitude && r.data.longitude) setDepZone(tzlookup(r.data.latitude, r.data.longitude)) }).catch(() => setDepZone(null));
                  }
                }}
                required
              />
            </FieldSet>
            <FieldSet>
              <Field>Arrival Airport (ICAO, e.g. KJFK)</Field>
              <AirportAutocomplete
                name="arr_airport"
                placeholder="KJFK"
                value={formData.arr_airport}
                onChange={(val, airport) => {
                  setFormData(prev => ({ ...prev, arr_airport: val }));
                  if (airport?.latitude && airport?.longitude) {
                    setArrZone(tzlookup(airport.latitude, airport.longitude));
                  } else if (val) {
                    api.get(`/airports/${val}`).then(r => { if (r.data.latitude && r.data.longitude) setArrZone(tzlookup(r.data.latitude, r.data.longitude)) }).catch(() => setArrZone(null));
                  }
                }}
                required
              />
            </FieldSet>
          </div>
        )}

        {/* 5. Times */}
        {isAircraftSelected && hasFlightNumber && hasAirports && !isAutoFilling && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 fade-in duration-500">
            <FieldSet>
              <Field>Departure {depZone ? `(${depZone})` : ""}</Field>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="date"
                  required
                  value={getDatePart(depLocalTime)}
                  onChange={(e) => handleDateChange("dep", e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="time"
                  required
                  value={getTimePart(depLocalTime)}
                  onChange={(e) => handleTimeChange("dep", e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-[0.8rem] text-muted-foreground">
                Local time {depZone ? `(${formatInTimeZone(depLocalTime ? new Date(depLocalTime) : new Date(), depZone, 'z')})` : ""}
              </p>
            </FieldSet>
            <FieldSet>
              <Field>Arrival {arrZone ? `(${arrZone})` : ""}</Field>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="date"
                  required
                  value={getDatePart(arrLocalTime)}
                  onChange={(e) => handleDateChange("arr", e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="time"
                  required
                  value={getTimePart(arrLocalTime)}
                  onChange={(e) => handleTimeChange("arr", e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-[0.8rem] text-muted-foreground">
                Local time {arrZone ? `(${formatInTimeZone(arrLocalTime ? new Date(arrLocalTime) : new Date(), arrZone, 'z')})` : ""}
              </p>
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
