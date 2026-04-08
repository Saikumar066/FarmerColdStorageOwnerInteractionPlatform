import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Thermometer,
  Weight,
  IndianRupee,
  Clock,
  CheckCircle,
} from "lucide-react";

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

interface StorageCardProps {
  storage: ColdStorage;
}

const StorageCard = ({ storage }: StorageCardProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "vegetables":
        return "bg-green-100 text-green-800";
      case "fruits":
        return "bg-orange-100 text-orange-800";
      case "both":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "vacant"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-1">
            {storage.name}
          </CardTitle>
          <Badge className={getStatusColor(storage.status)} variant="outline">
            {storage.status === "vacant" ? "✅ Available" : "❌ Full"}
          </Badge>
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="line-clamp-1">{storage.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-green-600 font-medium text-sm">
            <span className="bg-green-50 px-2 py-1 rounded-md">
              📍 {storage.distance} away
            </span>
          </div>
          <Badge className={getTypeColor(storage.type)} variant="secondary">
            {storage.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Thermometer className="w-4 h-4 mr-2 text-blue-500" />
              <span>Temperature</span>
            </div>
            <span className="font-medium text-blue-600">
              {storage.temperature}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Weight className="w-4 h-4 mr-2 text-purple-500" />
              <span>Capacity</span>
            </div>
            <span className="font-medium text-purple-600">
              {storage.capacity}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <IndianRupee className="w-4 h-4 mr-2 text-green-500" />
              <span>Price/Day</span>
            </div>
            <span className="font-medium text-green-600">
              ₹{storage.pricePerDay}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          {storage.status === "vacant" ? (
            <Link to={`/book/${storage.id}`} className="w-full">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Clock className="w-4 h-4 mr-2" />
                Book Now
              </Button>
            </Link>
          ) : (
            <Button disabled className="w-full" variant="outline">
              Currently Full
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageCard;
