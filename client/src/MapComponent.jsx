import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

export default function MapComponent() {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      const mapContainer = document.getElementById("map");
      if (!mapContainer) return;

      mapRef.current = L.map(mapContainer, {
        center: [20.5937, 78.9629],
        zoom: 5,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }


    async function loadHeatmap() {
      let data = [];
      try {
        const res = await fetch("http://localhost:5000/api/complaints/heatmap");
        if (res.ok) data = await res.json();
      } catch (err) {
        console.warn("Failed to fetch heatmap data", err);
      }
      // Map backend fields to lat/lng for the map, only if data is valid
      if (Array.isArray(data) && data.length > 0) {
        data = data.map((c) => ({
          lat: c.lat ?? (c.location ? c.location.latitude : undefined),
          lng: c.lng ?? (c.location ? c.location.longitude : undefined),
          city: c.city || (c.location ? c.location.city : undefined),
          country: c.country || (c.location ? c.location.country : undefined),
          description: c.description || "Complaint",
          status: c.status,
          createdAt: c.createdAt,
          slaHours: c.slaHours,
          overdue: c.overdue,
        })).filter((c) => typeof c.lat === "number" && typeof c.lng === "number");
      } else {
        data = [];
      }
      if (heatLayerRef.current) {
        mapRef.current.removeLayer(heatLayerRef.current);
      }
      const heatPoints = data.map((c) => [c.lat, c.lng, 1]);
      heatLayerRef.current = L.heatLayer(heatPoints, {
        radius: 35,
        blur: 25,
        maxZoom: 10,
      }).addTo(mapRef.current);
      data.forEach((c) => {
        const marker = L.circleMarker([c.lat, c.lng], {
          radius: 6,
          color: "#000",
          weight: 1,
          fillColor: c.overdue ? "red" : "blue",
          fillOpacity: 0.9,
        }).addTo(mapRef.current);

        marker.bindPopup(`
          <b>${c.city || "Unknown"}, ${c.country || ""}</b><br/>
          ${c.description}<br/>
          Status: ${c.status}<br/>
          Created: ${c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}<br/>
          SLA: ${c.slaHours}h<br/>
          ${
            c.overdue
              ? "<b style='color:red'>⚠ Overdue!</b>"
              : "<span style='color:green'>Within SLA</span>"
          }
        `);
      });

      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 500);
    }

    loadHeatmap();
    const interval = setInterval(loadHeatmap, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="map"
      style={{
        height: "420px",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "rgba(0,255,0,0.05)", 
      }}
    />
  );
}

