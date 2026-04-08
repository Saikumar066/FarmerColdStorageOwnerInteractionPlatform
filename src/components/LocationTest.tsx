import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const LocationTest = () => {
  const [status, setStatus] = useState<string>("Ready to test");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const testLocation = () => {
    setStatus("Testing location...");
    setLocation(null);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setStatus("❌ Geolocation is not supported by this browser");
      return;
    }

    setStatus("✅ Geolocation is supported. Requesting permission...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(coords);
        setStatus(
          `✅ Location obtained! Accuracy: ${position.coords.accuracy}m`
        );
        console.log("Full position object:", position);
      },
      (error) => {
        let errorMsg = "Unknown error";
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMsg = "Permission denied. Please allow location access.";
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMsg = "Position unavailable. Check your GPS/network.";
            break;
          case 3: // TIMEOUT
            errorMsg = "Request timed out. Please try again.";
            break;
        }
        setStatus(`❌ Error (${error.code}): ${errorMsg}`);
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Location Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testLocation} className="w-full">
          Test Location Access
        </Button>

        <div className="p-3 bg-gray-100 rounded text-sm">
          <strong>Status:</strong> {status}
        </div>

        {location && (
          <div className="p-3 bg-green-100 rounded text-sm">
            <strong>Coordinates:</strong>
            <br />
            Latitude: {location.lat.toFixed(6)}
            <br />
            Longitude: {location.lng.toFixed(6)}
          </div>
        )}

        <div className="text-xs text-gray-600 space-y-1">
          <p>
            <strong>Debug Info:</strong>
          </p>
          <p>• User Agent: {navigator.userAgent.split(" ")[0]}...</p>
          <p>• HTTPS: {window.location.protocol === "https:" ? "Yes" : "No"}</p>
          <p>
            • Localhost:{" "}
            {window.location.hostname === "localhost" ? "Yes" : "No"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationTest;
