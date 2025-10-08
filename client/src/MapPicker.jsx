import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapPicker = ({ onSelect, userLocation }) => {
  useEffect(() => {
    const map = L.map("map-picker").setView([20.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    let marker = null;

    map.on("click", function (e) {
      const { lat, lng } = e.latlng;
      if (marker) marker.remove();
      marker = L.marker([lat, lng]).addTo(map);
      onSelect({ lat, lng });
    });

    // 👇 if userLocation is passed (from "Use My Location")
    if (userLocation) {
      const { lat, lng } = userLocation;
      map.setView([lat, lng], 15);
      marker = L.marker([lat, lng]).addTo(map);
    }

    return () => {
      map.remove();
    };
  }, [userLocation]);

  return <div id="map-picker" style={{ height: "300px", width: "100%" }} />;
};

export default MapPicker;
