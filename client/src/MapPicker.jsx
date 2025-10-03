// src/components/MapPicker.jsx
import { useEffect, useRef } from "react";

export default function MapPicker({ onSelect }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      const script = document.createElement("script");
      script.src = "https://api.geoapify.com/v1/maps?apiKey=YOUR_API_KEY";
      script.async = true;
      script.onload = () => {
        const map = new window.Geoapify.Map({
          container: "mappicker",
          style: "https://maps.geoapify.com/v1/styles/positron/style.json",
          center: [78.9629, 20.5937],
          zoom: 5,
        });
        mapRef.current = map;

        map.on("click", (e) => {
          const { lat, lng } = e.lngLat;
          onSelect({ lat, lng });
        });
      };
      document.body.appendChild(script);
    }
  }, [onSelect]);

  return <div id="mappicker" style={{ width: "100%", height: 300, marginTop: 8 }} />;
}
