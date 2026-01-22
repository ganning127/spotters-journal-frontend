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
