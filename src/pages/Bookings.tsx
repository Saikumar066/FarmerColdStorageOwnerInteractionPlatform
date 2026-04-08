import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/auth";

interface Booking {
  booking_id: number;
  storage_id: number;
  start_time: string;
  end_time: string;
  quantity: string;
  produce: string;
  notes?: string;
  status: string; // Add booking status
  ColdStorage?: {
    name: string;
    location: string;
    cost_per_day?: number;
    status?: string;
  };
  createdAt?: string;
}

const Bookings = () => {
  const { farmer, token } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!farmer) return;
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/bookings/farmer/${farmer.farmer_id}`,
          {
            headers: getAuthHeaders(token),
          },
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch bookings");
        }
        const data = await res.json();
        setBookings(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load your bookings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [toast, farmer]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "active":
        return <Clock className="w-4 h-4 text-green-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Filter bookings based on booking status, not ColdStorage status
  const activeBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "active",
  );
  const completedBookings = bookings.filter((b) => b.status === "completed");

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            Manage and track your cold storage bookings
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {activeBookings.length}
                  </p>
                  <p className="text-sm text-gray-500">Active Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {completedBookings.length}
                  </p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {bookings.length}
                  </p>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CalendarDays className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No Bookings Yet
              </h3>
              <p className="text-gray-600 mb-4">
                You haven't made any cold storage bookings yet.
              </p>
              <Button onClick={() => (window.location.href = "/dashboard")}>
                Browse Storage Facilities
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, idx) => (
              <Card
                key={booking.booking_id ?? idx}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {booking.ColdStorage?.name || "Cold Storage"}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {booking.ColdStorage?.location || "N/A"}
                      </CardDescription>
                    </div>
                    <Badge
                      className={getStatusColor(booking.status || "")}
                      variant="outline"
                    >
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(booking.status || "")}
                        <span className="capitalize">
                          {booking.status || "N/A"}
                        </span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">
                        {formatDate(booking.start_time)} -{" "}
                        {formatDate(booking.end_time)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Produce</p>
                      <p className="font-medium">{booking.produce}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="font-medium">{booking.quantity}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Cost/Day</p>
                      <p className="font-medium text-green-600">
                        ₹{booking.ColdStorage?.cost_per_day || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                      Booked on{" "}
                      {booking.createdAt ? formatDate(booking.createdAt) : "-"}
                    </span>
                    <span>Booking ID: #{booking.booking_id}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
