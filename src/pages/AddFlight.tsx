import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import { PlaneTakeoff, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldSet } from "@/components/ui/field";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "react-router-dom";
import { AddRegistration } from "@/components/upload/AddRegistration";
import { AirportAutocomplete } from "@/components/ui/airport-autocomplete";
import type { AddFlightRequest } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import tzlookup from 'tz-lookup';
import { FlightGlobe } from "@/components/FlightGlobe";
import { StarRating } from "@/components/ui/star-rating";

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

  const [depCoords, setDepCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [arrCoords, setArrCoords] = useState<{ lat: number, lng: number } | null>(null);

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
    rating: 0,
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
            try { const r = await api.get(`/airports/${flight.dep_airport}`); if (r.data.latitude && r.data.longitude) { dZoneStr = tzlookup(r.data.latitude, r.data.longitude); setDepZone(dZoneStr); setDepCoords({ lat: r.data.latitude, lng: r.data.longitude }); } } catch { }
          }
          if (flight.arr_airport) {
            setPrevArrAirport(flight.arr_airport);
            try { const r = await api.get(`/airports/${flight.arr_airport}`); if (r.data.latitude && r.data.longitude) { aZoneStr = tzlookup(r.data.latitude, r.data.longitude); setArrZone(aZoneStr); setArrCoords({ lat: r.data.latitude, lng: r.data.longitude }); } } catch { }
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
            rating: flight.rating || 0,
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

  const searchFlightNumber = async () => {
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
              if (flightData.dep_icao && depInfo) updates.dep_airport = flightData.dep_icao;
              if (flightData.arr_icao && arrInfo) updates.arr_airport = flightData.arr_icao;
              return { ...prev, ...updates };
            });

            if (depInfo?.latitude && depInfo?.longitude) {
              setDepZone(tzlookup(depInfo.latitude, depInfo.longitude));
              setDepCoords({ lat: depInfo.latitude, lng: depInfo.longitude });
            }
            if (arrInfo?.latitude && arrInfo?.longitude) {
              setArrZone(tzlookup(arrInfo.latitude, arrInfo.longitude));
              setArrCoords({ lat: arrInfo.latitude, lng: arrInfo.longitude });
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

    try {
      const payload = {
        ...formData,
        dep_ts: finalDepTs,
        arr_ts: finalArrTs,
        airline_code: airlineCodeToUse,
        dep_airport: formData.dep_airport.toUpperCase(),
        arr_airport: formData.arr_airport.toUpperCase(),
        registration: formData.registration.toUpperCase(),
        dep_timezone: depZone || undefined,
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

  const isAircraftSelected = Boolean(formData.registration && formData.aircraft_type_id && formData.airline_code);
  const hasFlightNumber = Boolean(formData.flight_number);
  const hasAirports = Boolean(formData.dep_airport && formData.arr_airport);

  const flightDurationInfo = useMemo(() => {
    if (!depLocalTime || !arrLocalTime || !depZone || !arrZone) return null;

    const depTimePart = depLocalTime.split('T')[1];
    const arrTimePart = arrLocalTime.split('T')[1];
    if (!depTimePart || !arrTimePart || depTimePart.length < 5 || arrTimePart.length < 5) {
      return null;
    }

    try {
      const depDate = fromZonedTime(depLocalTime, depZone);
      const arrDate = fromZonedTime(arrLocalTime, arrZone);

      const diffMs = arrDate.getTime() - depDate.getTime();
      if (isNaN(diffMs) || diffMs <= 0) return null; // Invalid duration

      const totalMins = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;

      let str = "";
      if (hours > 0) str += `${hours} hour${hours > 1 ? 's' : ''}`;
      if (mins > 0) {
        if (str) str += ", ";
        str += `${mins} min${mins !== 1 ? 's' : ''}`;
      }
      return str || null;
    } catch {
      return null;
    }
  }, [depLocalTime, arrLocalTime, depZone, arrZone]);

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
                  {formData.airline_code} Flight Number
                  {isAutoFilling && <Spinner />}
                </span>
              </Field>
              <FieldDescription>
                Only enter the numerical digits.
              </FieldDescription>
              <div className="flex w-full items-start space-x-2">
                <Input
                  required
                  name="flight_number"
                  placeholder="1234"
                  type="number"
                  value={formData.flight_number}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      searchFlightNumber();
                    }
                  }}
                  className="uppercase placeholder:normal-case"
                />
                <Button
                  type="button"
                  onClick={searchFlightNumber}
                  disabled={isAutoFilling || !formData.flight_number}
                >
                  {isAutoFilling ? "Searching..." : "Search"}
                </Button>
              </div>
            </FieldSet>
          </div>
        )}

        {/* 3 & 4. Departure & Arrival Airports */}
        {isAircraftSelected && hasFlightNumber && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 fade-in duration-500">
            <FieldSet>
              <Field>Departure Airport</Field>
              <AirportAutocomplete
                name="dep_airport"
                placeholder="KATL"
                value={formData.dep_airport}
                onChange={(val, airport) => {
                  setFormData(prev => ({ ...prev, dep_airport: val }));
                  if (airport?.latitude && airport?.longitude) {
                    setDepZone(tzlookup(airport.latitude, airport.longitude));
                    setDepCoords({ lat: airport.latitude, lng: airport.longitude });
                  } else {
                    setDepCoords(null);
                  }
                }}
                required
              />
              <FieldDescription>ICAO Code (e.g. KJFK)</FieldDescription>
            </FieldSet>
            <FieldSet>
              <Field>Arrival Airport</Field>
              <AirportAutocomplete
                name="arr_airport"
                placeholder="KJFK"
                value={formData.arr_airport}
                onChange={(val, airport) => {
                  setFormData(prev => ({ ...prev, arr_airport: val }));
                  if (airport?.latitude && airport?.longitude) {
                    setArrZone(tzlookup(airport.latitude, airport.longitude));
                    setArrCoords({ lat: airport.latitude, lng: airport.longitude });
                  } else {
                    setArrCoords(null);
                  }
                }}
                required
              />
              <FieldDescription>ICAO Code (e.g. KATL)</FieldDescription>

            </FieldSet>
          </div>
        )}

        {/* 4.5. Flight Globe */}
        {isAircraftSelected && hasFlightNumber && hasAirports && depCoords && arrCoords && (
          <div className="w-full h-80 md:h-96 rounded-xl overflow-hidden relative border shadow-sm animate-in fade-in zoom-in-95 duration-500">
            <FlightGlobe
              depLat={depCoords.lat}
              depLng={depCoords.lng}
              arrLat={arrCoords.lat}
              arrLng={arrCoords.lng}
            />
          </div>
        )}

        {/* 5. Times */}
        {isAircraftSelected && hasFlightNumber && hasAirports && !isAutoFilling && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 fade-in duration-500">
            <FieldSet>
              <Field>Departure Time</Field>
              <FieldDescription>
                Local time {depZone && `(${depZone})`}
              </FieldDescription>

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
            </FieldSet>
            <FieldSet>
              <Field>Arrival Time</Field>
              <FieldDescription>
                Local time {arrZone && `(${arrZone})`}
              </FieldDescription>
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
            </FieldSet>

            {isAircraftSelected && hasFlightNumber && hasAirports && !isAutoFilling && flightDurationInfo && (
              <div className="w-full col-span-2 text-center text-sm font-medium text-muted-foreground bg-muted/100 py-2 rounded-md animate-in slide-in-from-top-2 fade-in duration-500">
                {flightDurationInfo} flight time
              </div>
            )}

          </div>
        )}


        {/* 6. Notes & Submit */}
        {isAircraftSelected && hasFlightNumber && hasAirports && !isAutoFilling && (
          <div className="space-y-8 animate-in slide-in-from-top-4 fade-in duration-500">
            <FieldSet>
              <Field>Flight Rating (Optional)</Field>
              <FieldDescription>How was your experience on this flight?</FieldDescription>
              <StarRating
                value={formData.rating || 0}
                onChange={(v) => setFormData(prev => ({ ...prev, rating: v }))}
              />
            </FieldSet>

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
