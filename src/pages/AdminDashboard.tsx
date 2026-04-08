import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeaders } from "@/lib/auth";

interface Stats {
  farmers: number;
  managers: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ farmers: 0, managers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/admin/stats",
          {
            headers: getAuthHeaders(),
          },
        );
        setStats(response.data);
      } catch (err: any) {
        setError("Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-4">Loading dashboard...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-center">Admin Dashboard</h1>
      <div className="text-lg">
        👨‍🌾 <strong>Total Farmers:</strong> {stats.farmers}
      </div>
      <div className="text-lg">
        🏬 <strong>Total Cold Storage Managers:</strong> {stats.managers}
      </div>
    </div>
  );
};

export default AdminDashboard;
