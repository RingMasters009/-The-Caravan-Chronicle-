import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.heat";

export default function MapComponent() {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([20.5937, 78.9629], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(mapRef.current);
    }

    async function loadHeatmap() {
      try {
        const res = await fetch("http://localhost:3000/api/complaints");
        const data = await res.json();
        if (heatLayerRef.current) {
          mapRef.current.removeLayer(heatLayerRef.current);
          heatLayerRef.current = null;
        }
        const heatData = data.map(c => [c.lat, c.lng, 1]);
        heatLayerRef.current = L.heatLayer(heatData, { radius: 35, blur: 25 }).addTo(mapRef.current);
        markersRef.current.forEach(m => mapRef.current.removeLayer(m));
        markersRef.current = [];
        data.forEach(c => {
          const circle = L.circleMarker([c.lat, c.lng], {
            radius: 6,
            color: "#000",
            weight: 1,
            fillColor: c.overdue ? "red" : "blue",
            fillOpacity: 0.9
          }).addTo(mapRef.current);

          circle.bindPopup(`
            <b>${c.city}, ${c.country}</b><br/>
            ${c.description}<br/>
            Status: ${c.status}<br/>
            Created: ${new Date(c.createdAt).toLocaleString()}<br/>
            SLA: ${c.slaHours}h<br/>
            ${c.overdue ? "<b style='color:red'>⚠ Overdue!</b>" : "<span style='color:green'>Within SLA</span>"}
          `);

          markersRef.current.push(circle);
        });

      } catch (err) {
        console.error("Error loading complaints:", err);
      }
    }
    loadHeatmap();
    const id = setInterval(loadHeatmap, 30000);
    return () => clearInterval(id);
  }, []);

  return <div id="map" style={{height: "100vh", width: "100%"}} />;
}

// src/MapComponent.jsx
// import React, { useEffect, useRef, useState } from "react";

// export default function MapComponent() {
//   const mapRef = useRef(null);
//   const [complaints, setComplaints] = useState([]);

//   // Fetch complaints every 30s
//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const res = await fetch("http://localhost:3000/api/complaints");
//         const data = await res.json();
//         setComplaints(data);
//       } catch (err) {
//         console.error("Error fetching complaints:", err);
//       }
//     }

//     fetchData();
//     const interval = setInterval(fetchData, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   // Initialize map
//   useEffect(() => {
//     if (!mapRef.current) {
//       const script = document.createElement("script");
//       script.src = "https://api.geoapify.com/v1/maps?apiKey=YOUR_API_KEY";
//       script.async = true;
//       script.onload = () => {
//         const map = new window.Geoapify.Map({
//           container: "map",
//           style: "https://maps.geoapify.com/v1/styles/positron/style.json",
//           center: [78.9629, 20.5937],
//           zoom: 5,
//         });
//         mapRef.current = map;
//       };
//       document.body.appendChild(script);
//     }
//   }, []);

//   // Update markers and heatmap
//   useEffect(() => {
//     const map = mapRef.current;
//     if (!map || complaints.length === 0) return;

//     // Remove existing markers/layers if any
//     if (map.markers) {
//       map.markers.forEach((m) => map.removeLayer(m));
//     }
//     map.markers = [];

//     // Add markers
//     complaints.forEach((c) => {
//       const marker = new window.Geoapify.Marker()
//         .setLatLng([c.lat, c.lng])
//         .addTo(map)
//         .bindPopup(`
//           <b>${c.city}, ${c.country}</b><br/>
//           ${c.description}<br/>
//           Status: ${c.status}<br/>
//           Created: ${new Date(c.createdAt).toLocaleString()}<br/>
//           SLA: ${c.slaHours}h<br/>
//           ${c.overdue ? "<b style='color:red'>⚠ Overdue!</b>" : "<span style='color:green'>Within SLA</span>"}
//         `);
//       map.markers.push(marker);
//     });

//     // Simple heatmap using circles
//     complaints.forEach((c) => {
//       const circle = new window.Geoapify.Circle({
//         center: [c.lat, c.lng],
//         radius: 10000,
//         fillColor: c.overdue ? "red" : "blue",
//         fillOpacity: 0.4,
//         stroke: false,
//       }).addTo(map);
//       map.markers.push(circle);
//     });
//   }, [complaints]);

//   return <div id="map" style={{ height: "100vh", width: "100%" }} />;
// }
