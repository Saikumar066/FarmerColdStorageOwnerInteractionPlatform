import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet with Webpack
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.divIcon({
  html: `<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    popup?: string;
    type?: "farmer" | "storage";
  }>;
  height?: string;
  className?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center,
  zoom = 13,
  markers = [],
  height = "400px",
  className = "",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    // Add markers
    markers.forEach((marker) => {
      const leafletMarker = L.marker(marker.position);

      // Customize marker based on type
      if (marker.type === "farmer") {
        leafletMarker.setIcon(
          L.divIcon({
            html: `<div style="background-color: #10B981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px; color: white;">🏠</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })
        );
      } else if (marker.type === "storage") {
        leafletMarker.setIcon(
          L.divIcon({
            html: `<div style="background-color: #3B82F6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px; color: white;">🏭</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })
        );
      }

      if (marker.popup) {
        leafletMarker.bindPopup(marker.popup);
      }

      leafletMarker.addTo(mapInstanceRef.current!);
    });

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, markers]);

  return (
    <div
      ref={mapRef}
      style={{ height }}
      className={`rounded-lg border ${className}`}
    />
  );
};

export default MapComponent;
