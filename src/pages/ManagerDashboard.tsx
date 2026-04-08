import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ManagerNavbar from "../components/ManagerNavbar";
import NotificationPanel from "../components/NotificationPanel";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthHeaders } from "@/lib/auth";

interface ColdStorage {
  storage_id: number;
  name: string;
  location: string;
  temperature: string;
  capacity: number;
  cost_per_day: string;
  status: string;
  type?: string;
}

const ManagerDashboard: React.FC = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    temperature: "",
    capacity: "",
    pricePerDay: "",
    type: "", // ✅ New: Vegetable type
  });

  const [storages, setStorages] = useState<ColdStorage[]>([]);
  const navigate = useNavigate();

  // features removed
  const typeOptions = [
    "Vegetables",
    "Fruits",
    "Grains",
    "Leafy Greens",
    "Roots",
  ];

  const managerIdStr = localStorage.getItem("managerId");
  const managerId =
    managerIdStr !== null && !isNaN(Number(managerIdStr))
      ? parseInt(managerIdStr, 10)
      : null;

  useEffect(() => {
    if (!managerId) {
      alert("Invalid or missing manager ID. Please log in again.");
      navigate("/manager-login");
      return;
    }

    const fetchStorages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/storages/manager/${managerId}`,
          { headers: getAuthHeaders(token) },
        );
        setStorages(response.data);
      } catch (error) {
        console.error("Error fetching storages:", error);
      }
    };

    fetchStorages();
  }, [managerId, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!managerId || isNaN(managerId)) {
      alert("Invalid or missing manager ID. Please log in again.");
      return;
    }

    if (!formData.type) {
      alert("Please select a vegetable type.");
      return;
    }

    try {
      // Convert capacity and pricePerDay to numbers, features to string if needed
      const payload = {
        name: formData.name,
        location: formData.location,
        temperature: formData.temperature,
        capacity: Number(formData.capacity),
        cost_per_day: Number(formData.pricePerDay),
        type: formData.type,
        manager_id: managerId,
      };

      await axios.post("http://localhost:5000/api/storages", payload, {
        headers: getAuthHeaders(token),
      });

      alert("Cold storage added successfully!");

      setFormData({
        name: "",
        location: "",
        temperature: "",
        capacity: "",
        pricePerDay: "",
        type: "",
      });

      const storagesRes = await axios.get(
        `http://localhost:5000/api/storages/manager/${managerId}`,
        { headers: getAuthHeaders(token) },
      );
      setStorages(storagesRes.data);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to add cold storage.");
    }
  };

  const updateStorageStatus = async (id: number, newStatus: string) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/storages/${id}/status`,
        {
          status: newStatus,
        },
        {
          headers: getAuthHeaders(token),
        },
      );

      const storagesRes = await axios.get(
        `http://localhost:5000/api/storages/manager/${managerId}`,
        { headers: getAuthHeaders(token) },
      );
      setStorages(storagesRes.data);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Status update failed.");
    }
  };

  return (
    <div>
      <ManagerNavbar />

      {/* Notification Panel */}
      {managerId && (
        <div className="max-w-6xl mx-auto mt-6 px-6">
          <NotificationPanel managerId={managerId} />
        </div>
      )}

      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Add Cold Storage
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Storage Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="temperature"
            placeholder="Temperature (e.g., 2-7°C)"
            value={formData.temperature}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            name="capacity"
            placeholder="Capacity (in tons)"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            name="pricePerDay"
            placeholder="Price per Day (₹)"
            value={formData.pricePerDay}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />

          {/* ✅ Vegetable Type Dropdown */}
          <div>
            <label className="block mb-1 font-semibold">Vegetable Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="" disabled>
                -- Select Type --
              </option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Submit
          </button>
        </form>
      </div>

      <div className="max-w-4xl mx-auto mt-12 p-6 bg-gray-100 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Your Cold Storages</h2>
        {storages.length === 0 ? (
          <p>No cold storages added yet.</p>
        ) : (
          <ul className="space-y-4">
            {storages.map((storage) => (
              <li
                key={storage.storage_id}
                className="bg-white p-4 rounded shadow"
              >
                <p>
                  <strong>Name:</strong> {storage.name}
                </p>
                <p>
                  <strong>Location:</strong> {storage.location}
                </p>
                <p>
                  <strong>Type:</strong> {storage.type || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                      storage.status === "vacant"
                        ? "bg-green-100 text-green-800"
                        : storage.status === "full"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {storage.status.charAt(0).toUpperCase() +
                      storage.status.slice(1)}
                  </span>
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() =>
                      updateStorageStatus(storage.storage_id, "vacant")
                    }
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      storage.status === "vacant"
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    Vacant
                  </button>
                  <button
                    onClick={() =>
                      updateStorageStatus(storage.storage_id, "full")
                    }
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      storage.status === "full"
                        ? "bg-red-600 text-white shadow-md"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    Full
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
