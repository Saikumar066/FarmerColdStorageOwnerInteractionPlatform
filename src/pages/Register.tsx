import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Phone, MapPin, Mail, Navigation } from "lucide-react";
import { LocationService } from "../services/locationService";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    password: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [managerData, setManagerData] = useState({
    username: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [loadingFarmer, setLoadingFarmer] = useState(false);
  const [loadingManager, setLoadingManager] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [gettingManagerLocation, setGettingManagerLocation] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isManager: boolean = false,
  ) => {
    if (isManager) {
      setManagerData({ ...managerData, [e.target.name]: e.target.value });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      console.log("🔄 Requesting location for farmer...");
      const coords = await LocationService.requestLocationPermission();
      if (coords) {
        console.log("✅ Farmer location received:", coords);
        setFormData((prev) => ({
          ...prev,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));
        toast({
          title: "Location Obtained",
          description: "Your location has been captured successfully!",
        });
      } else {
        console.log("❌ No coordinates returned for farmer");
        toast({
          title: "Location Error",
          description:
            "Could not get your location. Please check permissions and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Location error for farmer:", error);

      // Check if it's a permission error
      if (error instanceof Error && error.message.includes("denied")) {
        toast({
          title: "Location Permission Required",
          description:
            "Please click the location icon (🌍) in your browser's address bar and select 'Allow', then try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Location Error",
          description: `Failed to get location: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          variant: "destructive",
        });
      }
    } finally {
      setGettingLocation(false);
    }
  };

  const getCurrentLocationManager = async () => {
    setGettingManagerLocation(true);
    try {
      console.log("🔄 Requesting location for manager...");
      const coords = await LocationService.requestLocationPermission();
      if (coords) {
        console.log("✅ Manager location received:", coords);
        setManagerData((prev) => ({
          ...prev,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));
        toast({
          title: "Location Obtained",
          description: "Your location has been captured successfully!",
        });
      } else {
        console.log("❌ No coordinates returned for manager");
        toast({
          title: "Location Error",
          description:
            "Could not get your location. Please check permissions and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Location error for manager:", error);

      // Check if it's a permission error
      if (error instanceof Error && error.message.includes("denied")) {
        toast({
          title: "Location Permission Required",
          description:
            "Please click the location icon (🌍) in your browser's address bar and select 'Allow', then try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Location Error",
          description: `Failed to get location: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          variant: "destructive",
        });
      }
    } finally {
      setGettingManagerLocation(false);
    }
  };

  const handleFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingFarmer(true);
    try {
      const requestData = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        password: formData.password,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };
      console.log("🔥 Frontend sending farmer registration data:", requestData);

      const response = await axios.post(
        "http://localhost:5000/api/farmers/register",
        requestData,
      );
      const newFarmer = response.data.farmer;
      login(newFarmer, response.data.token);
      toast({
        title: "Farmer Registered",
        description: `Welcome, ${formData.name}!`,
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Frontend registration error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast({
        title: "Registration Failed",
        description:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoadingFarmer(false);
    }
  };

  const handleManagerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingManager(true);
    try {
      await axios.post("http://localhost:5000/api/managers/register", {
        username: managerData.username,
        email: managerData.email,
        phone: managerData.phone,
        city: managerData.city,
        password: managerData.password,
        latitude: managerData.latitude,
        longitude: managerData.longitude,
      });

      toast({
        title: "Manager Registered",
        description: `Welcome, ${managerData.username}!`,
      });

      setManagerData({
        username: "",
        email: "",
        phone: "",
        city: "",
        password: "",
        latitude: null,
        longitude: null,
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.error || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoadingManager(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 space-y-8">
      {/* Farmer Registration */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-800">
            Farmer Registration
          </CardTitle>
          <CardDescription>Create your account to book storage</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFarmerSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="farmer-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="farmer-name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleChange(e)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="farmer-phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="farmer-phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleChange(e)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="farmer-location">Location</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="farmer-location"
                    name="location"
                    type="text"
                    placeholder="Enter your city/district"
                    value={formData.location}
                    onChange={(e) => handleChange(e)}
                    className="pl-10"
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  title="Get current location"
                >
                  {gettingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formData.latitude && formData.longitude && (
                <p className="text-xs text-green-600">
                  ✓ Location captured: {formData.latitude.toFixed(6)},{" "}
                  {formData.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="farmer-password">Password</Label>
              <Input
                id="farmer-password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleChange(e)}
                className="pl-3"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loadingFarmer}
            >
              {loadingFarmer ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register as Farmer"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Manager Registration */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-800">
            Cold Storage Manager Registration
          </CardTitle>
          <CardDescription>
            Register to manage your cold storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManagerSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manager-username">Name</Label>
              <Input
                id="manager-username"
                name="username"
                type="text"
                placeholder="Enter your name"
                value={managerData.username}
                onChange={(e) => handleChange(e, true)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-email">Email</Label>
              <Input
                id="manager-email"
                name="email"
                type="email"
                placeholder="Enter email"
                value={managerData.email}
                onChange={(e) => handleChange(e, true)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-phone">Phone Number</Label>
              <Input
                id="manager-phone"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                value={managerData.phone}
                onChange={(e) => handleChange(e, true)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-city">City</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="manager-city"
                    name="city"
                    type="text"
                    placeholder="Enter your city"
                    value={managerData.city}
                    onChange={(e) => handleChange(e, true)}
                    className="pl-10"
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={getCurrentLocationManager}
                  disabled={gettingManagerLocation}
                  title="Get current location"
                >
                  {gettingManagerLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {managerData.latitude && managerData.longitude && (
                <p className="text-xs text-green-600">
                  ✓ Location captured: {managerData.latitude.toFixed(6)},{" "}
                  {managerData.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-password">Password</Label>
              <Input
                id="manager-password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={managerData.password}
                onChange={(e) => handleChange(e, true)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loadingManager}
            >
              {loadingManager ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register as Manager"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-600 hover:text-green-500 font-medium"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
