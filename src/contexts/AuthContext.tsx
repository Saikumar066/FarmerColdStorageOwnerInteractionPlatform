import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Farmer, Manager } from "src/types";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth";

// Define AuthContextType interface
interface AuthContextType {
  farmer: Farmer | null;
  manager: Manager | null;
  admin: { id?: number; username: string } | null;
  token: string | null;
  role: string | null;
  login: (farmer: Farmer, token?: string) => void;
  loginManager: (manager: Manager, token: string) => void;
  loginAdmin: (admin: { id?: number; username: string }, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Define children prop type
interface AuthProviderProps {
  children: ReactNode;
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [manager, setManager] = useState<Manager | null>(null);
  const [admin, setAdmin] = useState<{ id?: number; username: string } | null>(
    null,
  );
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedFarmer = localStorage.getItem("farmer");
    const storedManager = localStorage.getItem("manager");
    const storedAdmin = localStorage.getItem("admin");
    const storedRole = localStorage.getItem("authRole");
    const storedToken = getAuthToken();

    if (storedToken) {
      if (storedFarmer) setFarmer(JSON.parse(storedFarmer));
      if (storedManager) setManager(JSON.parse(storedManager));
      if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
      if (storedRole) setRole(storedRole);
      setToken(storedToken);
      return;
    }

    // Clear stale pre-JWT sessions so protected requests do not fire with missing tokens.
    localStorage.removeItem("farmer");
    localStorage.removeItem("manager");
    localStorage.removeItem("admin");
    localStorage.removeItem("managerId");
    localStorage.removeItem("authRole");
  }, []);

  const login = (farmerData: Farmer, jwtToken?: string) => {
    setFarmer(farmerData);
    setManager(null);
    setAdmin(null);
    localStorage.setItem("farmer", JSON.stringify(farmerData));
    localStorage.removeItem("manager");
    localStorage.removeItem("admin");

    if (jwtToken) {
      setAuthToken(jwtToken, "farmer");
      setToken(jwtToken);
      setRole("farmer");
    }
  };

  const loginManager = (managerData: Manager, jwtToken: string) => {
    setManager(managerData);
    setFarmer(null);
    setAdmin(null);
    localStorage.setItem("manager", JSON.stringify(managerData));
    localStorage.setItem("managerId", managerData.id.toString());
    localStorage.removeItem("farmer");
    localStorage.removeItem("admin");

    setAuthToken(jwtToken, "manager");
    setToken(jwtToken);
    setRole("manager");
  };

  const loginAdmin = (
    adminData: { id?: number; username: string },
    jwtToken: string,
  ) => {
    setAdmin(adminData);
    setFarmer(null);
    setManager(null);
    localStorage.setItem("admin", JSON.stringify(adminData));
    localStorage.removeItem("farmer");
    localStorage.removeItem("manager");

    setAuthToken(jwtToken, "admin");
    setToken(jwtToken);
    setRole("admin");
  };

  const logout = () => {
    setFarmer(null);
    setManager(null);
    setAdmin(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem("farmer");
    localStorage.removeItem("manager");
    localStorage.removeItem("admin");
    localStorage.removeItem("managerId");
    clearAuthToken();
  };

  return (
    <AuthContext.Provider
      value={{
        farmer,
        manager,
        admin,
        token,
        role,
        login,
        loginManager,
        loginAdmin,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
