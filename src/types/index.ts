// src/types/index.ts

export interface User {
  id: number;
  username: string;
  type: "admin" | "user";
}

export interface AircraftType {
  id: string; // ICAO Code
  manufacturer: string;
  type: string;
  variant: string;
}

export interface SpecificAircraft {
  registration: string;
  AircraftType: AircraftType;
  manufactured_date: string;
}

export interface Airport {
  name: string;
  icao_code: string;
}

export interface Photo {
  id: number;
  image_url: string;
  registration: string; // Foreign key
  SpecificAircraft: SpecificAircraft; // Joined data
  Airport: Airport; // Joined data
  taken_at: string;
  camera_model?: string;
}

export interface AuthResponse {
  message?: string;
  token: string;
  user: User;
}

export interface UploadPhotoRequest {
  registration: string;
  airport_code: string;
  image_url: string;
  taken_at?: string;
  shutter_speed?: string;
  iso?: number;
  aperture?: string;
  camera_model?: string;
  focal_length?: string;
  airline_code?: string;

  aircraft_type_id?: string; // ICAO Code
  manufactured_date?: string;

  airport_icao_code?: string;
  airport_name?: string;
  airport_latitude?: number;
  airport_longitude?: number;
}

export interface Airline {
  code: string; // ICAO 3-letter Code
  name: string; // friendly readable name
  reg_suffix?: string[]; // heuristic, registration suffix for this airline
  reg_prefix?: string[]; // heuristic, registration prefix for this airline
}

export interface BasicAirportInfo {
  icao_code: string;
  name: string;
}
