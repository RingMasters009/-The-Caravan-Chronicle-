// src/App.jsx
import { useState } from "react";
import MapComponent from "./MapComponent";
import ComplaintForm from "./ComplaintForm";

export default function App() {
  const [page, setPage] = useState("map");

  return (
    <div style={{ height: "100vh" }}>
      <header style={{ padding: 10, background: "#eee" }}>
        <button onClick={() => setPage("map")}>Map</button>
        <button onClick={() => setPage("form")}>Complaint Form</button>
      </header>

      {page === "map" && <MapComponent />}
      {page === "form" && <ComplaintForm />}
    </div>
  );
}
