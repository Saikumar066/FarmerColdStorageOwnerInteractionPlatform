import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import StorageCard from "../components/StorageCard";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Thermometer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/auth";

interface ColdStorage {
  id: string;
  name: string;
  location: string;
  type: "vegetables" | "fruits" | "both";
  status: "vacant" | "full";
  capacity: string;
  temperature: string;
  pricePerDay: number;
  distance: string;
}

interface Booking {
  booking_id: number;
  storage_id: number;
  start_time: string;
  end_time: string;
  quantity: string;
  produce: string;
  notes?: string;
  ColdStorage?: {
    name: string;
    location: string;
    cost_per_day?: number;
    status?: string;
  };
  createdAt?: string;
}

const Dashboard = () => {
  const { farmer } = useAuth();
  const { toast } = useToast();
  const [storages, setStorages] = useState<ColdStorage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "vegetables" | "fruits" | "both"
  >("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "vacant" | "full">(
    "all",
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  // Fetch bookings for the logged-in farmer
  useEffect(() => {
    const fetchBookings = async () => {
      if (!farmer || !farmer.farmer_id) {
        console.log("No farmer ID available", farmer);
        setBookingsLoading(false);
        return;
      }
      setBookingsLoading(true);
      try {
        console.log("Fetching bookings for farmer:", farmer.farmer_id);
        const res = await fetch(
          `http://localhost:5000/api/bookings/farmer/${farmer.farmer_id}`,
          {
            headers: getAuthHeaders(),
          },
        );
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Server response:", errorText);
          throw new Error(
            `Failed to fetch bookings: ${res.status} ${res.statusText}`,
          );
        }
        const data = await res.json();
        console.log("Bookings data received:", data); // Debug log
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error loading bookings",
          description: error.message,
          variant: "destructive",
        });
        setBookings([]);
      } finally {
        setBookingsLoading(false);
      }
    };
    fetchBookings();
  }, [farmer]);

  // Mock data for cold storages (features removed)
  const mockStorages: ColdStorage[] = [
    {
      id: "1",
      name: "Green Valley Cold Storage",
      location: "Sector 12, Punjab",
      type: "vegetables",
      status: "vacant",
      capacity: "500 tons",
      temperature: "2-4°C",
      pricePerDay: 150,
      distance: "2.5 km",
    },
    {
      id: "2",
      name: "Fresh Fruits Hub",
      location: "Industrial Area, Haryana",
      type: "fruits",
      status: "vacant",
      capacity: "300 tons",
      temperature: "0-2°C",
      pricePerDay: 200,
      distance: "5.8 km",
    },
    {
      id: "3",
      name: "Farm Fresh Storage",
      location: "Agricultural Zone, Gujarat",
      type: "both",
      status: "full",
      capacity: "800 tons",
      temperature: "1-3°C",
      pricePerDay: 120,
      distance: "12.3 km",
    },
    {
      id: "4",
      name: "Cool Harvest Center",
      location: "Market Road, Punjab",
      type: "vegetables",
      status: "vacant",
      capacity: "400 tons",
      temperature: "3-5°C",
      pricePerDay: 180,
      distance: "7.2 km",
    },
    {
      id: "5",
      name: "Premium Fruit Storage",
      location: "Export Hub, Maharashtra",
      type: "fruits",
      status: "vacant",
      capacity: "600 tons",
      temperature: "0-1°C",
      pricePerDay: 250,
      distance: "15.7 km",
    },
    {
      id: "6",
      name: "Agri-Cold Solutions",
      location: "Village Road, Rajasthan",
      type: "both",
      status: "full",
      capacity: "350 tons",
      temperature: "2-4°C",
      pricePerDay: 140,
      distance: "9.1 km",
    },
  ];

  useEffect(() => {
    // Try to fetch from backend, fallback to mock data
    const fetchStorages = async () => {
      setLoading(true);
      try {
        let url = "http://localhost:5000/api/storages";

        // Add farmer coordinates to the request if available
        if (farmer?.latitude && farmer?.longitude) {
          url += `?farmer_lat=${farmer.latitude}&farmer_lng=${farmer.longitude}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        // Map backend data to frontend ColdStorage shape
        const mapped = data.map((s: any) => ({
          id: s.storage_id?.toString() || s.id?.toString() || "",
          name: s.name,
          location: s.location,
          type: s.type,
          status: s.status,
          capacity: s.capacity + " tons",
          temperature: s.temperature,
          pricePerDay: Number(s.cost_per_day),
          distance: s.distance || "N/A",
        }));
        setStorages(mapped);
      } catch (error) {
        setStorages(mockStorages);
        toast({
          title: "Error",
          description:
            "Failed to load cold storages from server. Showing sample data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStorages();
  }, [toast, farmer]);

  const filteredStorages = storages.filter((storage) => {
    const matchesSearch =
      storage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      storage.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || storage.type === filterType;
    const matchesStatus =
      filterStatus === "all" || storage.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const vacantCount = storages.filter((s) => s.status === "vacant").length;
  const totalCount = storages.length;

  // Find nearest storage
  const getNearestStorage = () => {
    if (storages.length === 0) return null;

    // Sort storages by distance (parse the numeric value from distance string)
    const sortedByDistance = [...storages].sort((a, b) => {
      const distanceA =
        parseFloat(a.distance.replace(/[^\d.]/g, "")) || Infinity;
      const distanceB =
        parseFloat(b.distance.replace(/[^\d.]/g, "")) || Infinity;
      return distanceA - distanceB;
    });

    return sortedByDistance[0];
  };

  const nearestStorage = getNearestStorage();

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {farmer?.name}! 👋
          </h1>
          <p className="text-gray-600 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {farmer?.location}
          </p>
        </div>

        {/* My Bookings Section */}
        <div className="mb-8">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">My Bookings</CardTitle>
              <Link to="/bookings">
                <Button size="sm" variant="outline">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="text-gray-500">Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="text-gray-500">No bookings yet.</div>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking, idx) => (
                    <div
                      key={booking.booking_id ?? idx}
                      className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-2 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <div className="font-medium">
                          {booking.ColdStorage?.name || "Cold Storage"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.ColdStorage?.location || "N/A"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {booking.produce} • {booking.quantity}
                        </div>
                      </div>
                      <div className="flex flex-col md:items-end mt-2 md:mt-0">
                        <span className="text-xs text-gray-500">
                          {new Date(booking.start_time).toLocaleDateString(
                            "en-IN",
                          )}{" "}
                          -{" "}
                          {new Date(booking.end_time).toLocaleDateString(
                            "en-IN",
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          Status: {booking.ColdStorage?.status || "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Available Storage</CardTitle>
              <CardDescription>Cold storages ready for booking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {vacantCount}
              </div>
              <p className="text-sm text-gray-500">out of {totalCount} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Average Temperature</CardTitle>
              <CardDescription>Optimal storage conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 flex items-center">
                <Thermometer className="w-8 h-8 mr-2" />
                2°C
              </div>
              <p className="text-sm text-gray-500">to 4°C range</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Nearest Location</CardTitle>
              <CardDescription>Closest cold storage facility</CardDescription>
            </CardHeader>
            <CardContent>
              {nearestStorage ? (
                <>
                  <div className="text-3xl font-bold text-purple-600">
                    {nearestStorage.distance}
                  </div>
                  <p className="text-sm text-gray-500">{nearestStorage.name}</p>
                  <p className="text-xs text-gray-400">
                    {nearestStorage.location}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-400">--</div>
                  <p className="text-sm text-gray-500">No facilities found</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                  className={
                    filterType === "all"
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }
                >
                  All Types
                </Button>
                <Button
                  variant={filterType === "vegetables" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("vegetables")}
                  className={
                    filterType === "vegetables"
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }
                >
                  Vegetables
                </Button>
                <Button
                  variant={filterType === "fruits" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("fruits")}
                  className={
                    filterType === "fruits"
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }
                >
                  Fruits
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                  className={
                    filterStatus === "all"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                >
                  All Status
                </Button>
                <Button
                  variant={filterStatus === "vacant" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("vacant")}
                  className={
                    filterStatus === "vacant"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                >
                  Available
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredStorages.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No Storage Found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStorages.map((storage) => (
              <StorageCard key={storage.id} storage={storage} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
