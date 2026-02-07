import { useEffect } from "react";
import { useMap, useMapEvents, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { type Barangay } from "@shared/schema";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerIcon2xPng from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

// Fix for default Leaflet marker icons in React
const defaultIcon = new Icon({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2xPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom highlighted marker for selected location
const selectedIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapControllerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation: { lat: number; lng: number } | null;
  selectedBarangay: Barangay | null | undefined;
}

export function MapController({ 
  onLocationSelect, 
  selectedLocation, 
  selectedBarangay 
}: MapControllerProps) {
  const map = useMap();

  // Handle Map Clicks
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom() > 13 ? map.getZoom() : 13, {
        animate: true,
        duration: 1.5
      });
    },
  });

  // Effect to recenter if selected externally (optional)
  useEffect(() => {
    if (selectedLocation) {
      // We don't auto-move here to avoid fighting the user, 
      // but we could if we wanted to enforce focus.
    }
  }, [selectedLocation, map]);

  if (!selectedLocation) return null;

  return (
    <Marker 
      position={[selectedLocation.lat, selectedLocation.lng]} 
      icon={selectedIcon}
    >
      <Popup closeButton={false} className="font-sans">
        <div className="p-1 text-center">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
            Selected Location
          </p>
          {selectedBarangay ? (
            <p className="text-sm font-bold text-primary">{selectedBarangay.name}</p>
          ) : (
            <p className="text-xs text-muted-foreground italic">Fetching details...</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
