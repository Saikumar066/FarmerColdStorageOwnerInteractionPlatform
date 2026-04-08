import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarDays,
  Clock,
  MapPin,
  Thermometer,
  Weight,
  IndianRupee,
  ArrowLeft,
} from "lucide-react";
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

const BookStorage = () => {
  const { storageId } = useParams();
  const navigate = useNavigate();
  const { farmer, token } = useAuth();
  const { toast } = useToast();

  const [storage, setStorage] = useState<ColdStorage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: "",
    endDate: "",
    quantity: "",
    produce: "",
    notes: "",
  });

  // Mock storage data (features removed)
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
  ];

  useEffect(() => {
    const fetchStorage = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/storages/${storageId}`,
        );
        if (!res.ok) throw new Error("API error");
        const s = await res.json();
        // Map backend data to frontend ColdStorage shape
        const mapped: ColdStorage = {
          id: s.storage_id?.toString() || s.id?.toString() || "",
          name: s.name,
          location: s.location,
          type: s.type,
          status: s.status,
          capacity: s.capacity + " tons",
          temperature: s.temperature,
          pricePerDay: Number(s.cost_per_day),
          distance: s.distance || "N/A",
        };
        setStorage(mapped);
      } catch (error) {
        // fallback to mock data
        const foundStorage = mockStorages.find((s) => s.id === storageId);
        setStorage(foundStorage || null);
        toast({
          title: "Error",
          description:
            "Failed to load storage details from server. Showing sample data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStorage();
  }, [storageId, toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateDays = () => {
    if (bookingData.startDate && bookingData.endDate) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const calculateTotal = () => {
    const days = calculateDays();
    return days * (storage?.pricePerDay || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validation
      if (!farmer?.farmer_id) {
        throw new Error("You must be logged in as a farmer to make a booking.");
      }

      if (!storage?.id) {
        throw new Error("Invalid storage selection.");
      }

      if (
        !bookingData.startDate ||
        !bookingData.endDate ||
        !bookingData.quantity ||
        !bookingData.produce
      ) {
        throw new Error("Please fill in all required fields.");
      }

      // Prepare booking payload
      const payload = {
        farmer_id: farmer?.farmer_id,
        storage_id: Number(storage?.id), // Convert string back to number
        start_time: bookingData.startDate,
        end_time: bookingData.endDate,
        quantity: bookingData.quantity,
        produce: bookingData.produce,
        notes: bookingData.notes,
      };

      console.log("🔥 Frontend sending booking data:", payload);

      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMessage = `Booking failed (${res.status})`;

        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await res.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }

        throw new Error(errorMessage);
      }

      toast({
        title: "Booking Confirmed! 🎉",
        description: `Your cold storage booking at ${storage?.name} has been confirmed.`,
      });

      navigate("/bookings");
    } catch (error: any) {
      console.error("❌ Frontend booking error:", error);

      let errorMessage = "Something went wrong. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!storage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Storage Not Found</h2>
            <p className="text-gray-600 mb-4">
              The requested cold storage could not be found.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">
            Book Cold Storage
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Storage Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{storage.name}</CardTitle>
              <CardDescription className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {storage.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="font-medium">{storage.temperature}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Weight className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Capacity</p>
                    <p className="font-medium">{storage.capacity}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <IndianRupee className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Price per Day</p>
                    <p className="font-medium">₹{storage.pricePerDay}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Distance</p>
                    <p className="font-medium">{storage.distance}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>
                Fill in your booking information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={bookingData.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={bookingData.endDate}
                      onChange={handleInputChange}
                      min={
                        bookingData.startDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity (in kg/tons)</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="text"
                    placeholder="e.g., 500 kg or 2 tons"
                    value={bookingData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="produce">Type of Produce</Label>
                  <Input
                    id="produce"
                    name="produce"
                    type="text"
                    placeholder="e.g., Potatoes, Apples, Mixed vegetables"
                    value={bookingData.produce}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Any special requirements or instructions..."
                    value={bookingData.notes}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                {/* Booking Summary */}
                {bookingData.startDate && bookingData.endDate && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Booking Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{calculateDays()} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate per day:</span>
                        <span>₹{storage.pricePerDay}</span>
                      </div>
                      <div className="flex justify-between font-medium text-lg border-t pt-2">
                        <span>Total Cost:</span>
                        <span className="text-green-600">
                          ₹{calculateTotal()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                      Confirming Booking...
                    </>
                  ) : (
                    <>
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookStorage;
