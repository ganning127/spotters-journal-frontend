// src/types/index.ts

export interface User {
  id: number;
  username: string;
  type: "admin" | "user";
}

export interface AircraftType {
  icao_type: string; // ICAO Code
  manufacturer: string;
  type: string;
  variant: string;
}

export interface SpecificAircraft {
  icao_type: string;
  manufactured_date: string | null;
  AircraftType: AircraftType;
}

export interface RegistrationHistory {
  registration: string;
  airline: string | null;
  is_current: boolean;
  SpecificAircraft: SpecificAircraft;
}

export interface Airport {
  name: string;
  icao_code: string;
}

export interface Photo {
  id: number;
  image_url: string;
  uuid_rh: string;
  RegistrationHistory: RegistrationHistory; // Joined data
  Airport: Airport; // Joined data
  taken_at: string;
  camera_model?: string;
  shutter_speed?: string;
  iso?: number;
  aperture?: string;
  focal_length?: string;
  airport_code: string;
}

export interface AuthResponse {
  message?: string;
  token: string;
  user: User;
}

export interface UploadPhotoRequest {
  registration: string;
  airport_code: string;
  taken_at?: string;
  shutter_speed?: string;
  iso?: number;
  aperture?: string;
  camera_model?: string;
  focal_length?: string;
  airline_code?: string;

  uuid_rh?: string; // Existing Registration History UUID

  aircraft_type_id?: string; // ICAO Code
  airport_latitude?: number | undefined;
  airport_longitude?: number | undefined;
  manufactured_date?: string | undefined;
}

export interface Airline {
  code: string; // ICAO 3-letter Code
  name: string; // friendly readable name
  reg_suffix?: string[]; // heuristic, registration suffix for this airline
  reg_prefix?: string[]; // heuristic, registration prefix for this airline
  domain?: string;
}

export interface BasicAirportInfo {
  icao_code: string;
  name: string;
  latitude?: number;
  longitude?: number;
}

export interface ManufacturerCountsResponse {
  manufacturer: string;
  photo_count: number;
}

export interface AirportCountsResponse {
  icao_code: string;
  name: string;
  photo_count: number;
}

export interface MostSeenAircraftResponse {
  registration: string;
  aircraft_type: string;
  aircraft_variant: string;
  manufacturer: string;
  photo_count: number;
  image_url: string;
}

export interface AirlineCountsResponse {
  airline_code: string;
  airline_name: string;
  airline_color: string;
  photo_count: number;
}

export interface AirplaneCountsResponse {
  airplane_code: string;
  airplane_manufacturer: string;
  airplane_type: string;
  airplane_variant: string;
  photo_count: number;
}

export interface PhotoCountItem {
  photo_year: number;
  photo_count: number;
}

export interface AddFlightRequest {
  date: string;
  dep_airport: string;
  arr_airport: string;
  flight_number: string;
  notes: string;
  
  registration: string;
  aircraft_type_id?: string;
  airline_code?: string;
  uuid_rh?: string;
  manufactured_date?: string;
  dep_ts?: string;
  arr_ts?: string;
}

export interface UserFlight {
  uuid_flight: string;
  date: string;
  dep_airport: string;
  arr_airport: string;
  flight_number: string;
  airline_code: string;
  distance: number;
  notes?: string;
  dep_ts?: string;
  arr_ts?: string;
  user_id?: number;
  dep?: BasicAirportInfo;
  arr?: BasicAirportInfo;
  airline?: Airline;
  RegistrationHistory?: RegistrationHistory;
}

export interface Suggestion {
  type_id: string;
  uuid_rh: string;
  airline?: string;
  airline_name?: string;
  Photo: Photo[];
  SpecificAircraft: {
    icao_type: string;
    manufacturer: string;
    type: string;
    variant: string;
  };
  UserFlight?: UserFlight[];
}

export interface FlightOverviewResponse {
  totalFlights: number;
  totalDistance: number;
  totalAirTimeMinutes: number;
}

export interface TopAirlineResponse {
  code: string;
  name: string;
  domain?: string;
  brand_color?: string;
  flight_count: number;
  total_distance: number;
  total_time_mins?: number;
}

export interface TopRegistrationResponse {
  uuid_rh: string;
  registration: string;
  icao_type?: string;
  manufacturer?: string;
  type?: string;
  flight_count: number;
  total_distance: number;
  cover_photo?: string;
}

export interface TopRouteResponse {
  route: string;
  dep_airport: string;
  arr_airport: string;
  dep_name?: string;
  arr_name?: string;
  flight_count: number;
  total_distance: number;
}

export interface TopAircraftTypeResponse {
  icao_type: string;
  manufacturer?: string;
  type?: string;
  variant?: string;
  flight_count: number;
  total_distance: number;
}

export interface TopAirportResponse {
  icao_code: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  state?: string;
  country?: string;
  total_visits: number;
  departures: number;
  arrivals: number;
}
