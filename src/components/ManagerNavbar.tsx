// src/components/ManagerNavbar.tsx

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const ManagerNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/manager-login");
  };

  return (
    <nav className="w-full bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-green-600">Manager Dashboard</h1>
      <Button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </Button>
    </nav>
  );
};

export default ManagerNavbar;
