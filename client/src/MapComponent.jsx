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

      // 🗺️ Initialize map
      mapRef.current = L.map(mapContainer, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: false,
        worldCopyJump: true,
        preferCanvas: true,
      });

      // 🌍 Google-like tile style (CartoDB Positron)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(mapRef.current);

      // 🧭 Add zoom control in bottom right
      L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);
    }

    async function loadHeatmap() {
      try {
        const res = await fetch("http://localhost:5000/api/complaints/heatmap");
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          console.warn("No complaint data found for heatmap");
          return;
        }

        const validPoints = data
          .filter((c) => typeof c.lat === "number" && typeof c.lng === "number")
          .map((c) => [c.lat, c.lng, 1]);

        if (heatLayerRef.current) {
          mapRef.current.removeLayer(heatLayerRef.current);
        }

        // 🔥 Enhanced heat layer
        heatLayerRef.current = L.heatLayer(validPoints, {
          radius: 45,
          blur: 35,
          maxZoom: 12,
          gradient: {
            0.1: "#00bfff",
            0.35: "#00ff99",
            0.65: "#ffee00",
            0.9: "#ff5500",
            1.0: "#ff0000",
          },
        }).addTo(mapRef.current);

        // 🎯 Add modern popups
        data.forEach((c) => {
          if (typeof c.lat === "number" && typeof c.lng === "number") {
            const marker = L.circleMarker([c.lat, c.lng], {
              radius: 7,
              color: "#fff",
              weight: 1.2,
              fillColor: c.overdue ? "#ff4444" : "#007bff",
              fillOpacity: 0.95,
            }).addTo(mapRef.current);

            marker.bindPopup(`
              <div style="
                font-size:13px;
                font-family:'Inter', sans-serif;
                line-height:1.4;
                color:#222;
                background:#fff;
                border-radius:8px;
                padding:6px 8px;
                box-shadow:0 2px 10px rgba(0,0,0,0.1);
              ">
                <b style="font-size:14px;">${c.city || "Unknown City"}</b><br/>
                <b>Status:</b> ${c.status}<br/>
                <b>Created:</b> ${
                  c.createdAt ? new Date(c.createdAt).toLocaleString() : "N/A"
                }<br/>
                <b>SLA:</b> ${c.slaHours ?? "N/A"}h<br/>
                ${
                  c.overdue
                    ? "<span style='color:red;font-weight:bold'>⚠ Overdue</span>"
                    : "<span style='color:green;font-weight:bold'>✔ On Time</span>"
                }
              </div>
            `);
          }
        });

        // Fit map to all points
        if (validPoints.length > 0) {
          const bounds = L.latLngBounds(validPoints.map(([lat, lng]) => [lat, lng]));
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }

        // Recalculate map layout
        setTimeout(() => mapRef.current.invalidateSize(), 400);
      } catch (err) {
        console.error("Failed to fetch heatmap data:", err);
      }
    }

    loadHeatmap();
    const interval = setInterval(loadHeatmap, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="map"
      style={{
        height: "450px",
        width: "100%",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 8px 35px rgba(0,0,0,0.15)",
        border: "1px solid rgba(0,0,0,0.08)",
        backgroundColor: "#f8f9fa",
      }}
    />
  );
}
