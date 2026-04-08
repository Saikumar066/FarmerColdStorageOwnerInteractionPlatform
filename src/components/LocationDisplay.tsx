import React from "react";
import { MapPin, Navigation, Clock } from "lucide-react";

interface LocationDisplayProps {
  distance?: string;
  location: string;
  showNavigation?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({
  distance = "N/A",
  location,
  showNavigation = false,
  coordinates,
}) => {
  const openInMaps = () => {
    if (coordinates) {
      const { latitude, longitude } = coordinates;
      // Open in default maps app (works on mobile and desktop)
      const url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
      window.open(url, "_blank");
    }
  };

  const getDistanceColor = (dist: string) => {
    if (dist === "N/A") return "text-gray-500";
    const numericDistance = parseFloat(dist);
    if (numericDistance <= 5) return "text-green-600";
    if (numericDistance <= 15) return "text-yellow-600";
    return "text-red-600";
  };

  const getDistanceIcon = (dist: string) => {
    if (dist === "N/A") return "📍";
    const numericDistance = parseFloat(dist);
    if (numericDistance <= 5) return "🟢";
    if (numericDistance <= 15) return "🟡";
    return "🔴";
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <MapPin className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600 truncate">{location}</span>
      </div>

      <div className="flex items-center space-x-2">
        <div
          className={`flex items-center space-x-1 ${getDistanceColor(
            distance
          )} font-medium text-sm`}
        >
          <span>{getDistanceIcon(distance)}</span>
          <span>{distance}</span>
          {distance !== "N/A" && <span className="text-xs">away</span>}
        </div>

        {showNavigation && coordinates && (
          <button
            onClick={openInMaps}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Open in maps"
          >
            <Navigation className="w-4 h-4 text-blue-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LocationDisplay;
