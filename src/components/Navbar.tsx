import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Home,
  BarChart3,
  Calendar,
  LogOut,
  Languages,
  Menu,
} from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { isAuthenticated, logout, farmer, manager, admin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Removed language state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Removed toggleLanguage function

  // Removed getLanguageText function

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    ...(farmer
      ? [
          { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
          { path: "/bookings", label: "My Bookings", icon: Calendar },
        ]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <span className="text-xl font-bold text-green-800 hidden sm:block">
              Cold Storage
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  isActive(path)
                    ? "bg-green-100 text-green-800 font-medium"
                    : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            {/* Removed Language Toggle Button */}

            {farmer ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 hidden sm:block">
                  Welcome, {farmer.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : manager ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 hidden sm:block">
                  Welcome, {manager.username}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : admin ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 hidden sm:block">
                  Admin, {admin.username}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Register
                  </Button>
                </Link>
                <Link to="/admin-login">
                  <Button variant="outline" size="sm">
                    Admin Login
                  </Button>
                </Link>
                <Link to="/manager-login">
                  <Button variant="outline" size="sm">
                    Manager Login
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md block ${
                    isActive(path)
                      ? "bg-green-100 text-green-800 font-medium"
                      : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
              {!farmer && !manager && !admin && (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                  <Link to="/admin-login">Admin Login</Link>
                  <Link to="/manager-login">Manager Login</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
