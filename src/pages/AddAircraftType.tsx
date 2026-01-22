import { useState } from "react";
import type { FormEvent } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function AddAircraftType() {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    id: "", // ICAO Code (e.g., B738)
    manufacturer: "", // e.g., Boeing
    type: "", // e.g., 737
    variant: "", // e.g., 800
  });

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
    setSuccess("");

    try {
      await api.post("/aircraft-types", formData);
      setSuccess(
        `Successfully added ${formData.manufacturer} ${formData.type}`,
      );
      setFormData({ id: "", manufacturer: "", type: "", variant: "" }); // Reset
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add aircraft type");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add Aircraft Type</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded border border-green-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ICAO Designator (ID)
          </label>
          <input
            type="text"
            placeholder="e.g. B738"
            required
            maxLength={4}
            className="w-full p-3 border rounded uppercase font-mono"
            value={formData.id}
            onChange={(e) =>
              setFormData({ ...formData, id: e.target.value.toUpperCase() })
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            Unique 3-4 letter code used in flight plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manufacturer
            </label>
            <input
              type="text"
              placeholder="e.g. Boeing"
              required
              className="w-full p-3 border rounded"
              value={formData.manufacturer}
              onChange={(e) =>
                setFormData({ ...formData, manufacturer: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model / Type
            </label>
            <input
              type="text"
              placeholder="e.g. 737"
              required
              className="w-full p-3 border rounded"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Variant (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. 800 or MAX 8"
            className="w-full p-3 border rounded"
            value={formData.variant}
            onChange={(e) =>
              setFormData({ ...formData, variant: e.target.value })
            }
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition"
        >
          Create Aircraft Type
        </button>
      </form>
    </div>
  );
}
