// src/pages/AddAirport.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function AddAirport() {
  const { user } = useAuth();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    icao_code: "",
    name: "",
    latitude: "",
    longitude: "",
  });

  // Client-side protection (optional, as backend also checks)
  if (user?.type !== "admin") {
    return (
      <div className="p-10 text-center text-red-500">
        Access Denied: Admins Only
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/airports", formData);
      alert("Airport added successfully!");
      setFormData({ icao_code: "", name: "", latitude: "", longitude: "" }); // Reset form
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add airport");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add New Airport</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ICAO Code
            </label>
            <input
              type="text"
              placeholder="e.g. KATL"
              required
              maxLength={4}
              className="w-full p-3 border rounded uppercase font-mono"
              value={formData.icao_code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  icao_code: e.target.value.toUpperCase(),
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Airport Name
            </label>
            <input
              type="text"
              placeholder="e.g. Hartsfield-Jackson"
              required
              className="w-full p-3 border rounded"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="33.6407"
              required
              className="w-full p-3 border rounded"
              value={formData.latitude}
              onChange={(e) =>
                setFormData({ ...formData, latitude: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="-84.4277"
              required
              className="w-full p-3 border rounded"
              value={formData.longitude}
              onChange={(e) =>
                setFormData({ ...formData, longitude: e.target.value })
              }
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition"
        >
          Create Airport
        </button>
      </form>
    </div>
  );
}
