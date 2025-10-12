import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default icon issue with modern bundlers (like Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

const StaffRouteMap = ({ complaints = [] }) => {
  const validComplaints = complaints.filter(
    (c) => c.location?.latitude && c.location?.longitude
  );

  if (validComplaints.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-slate-400">
        No assigned complaints with location data to display on the map.
      </div>
    );
  }

  const center = [
    validComplaints[0].location.latitude,
    validComplaints[0].location.longitude,
  ];

  return (
    <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {validComplaints.map((complaint) => (
        <Marker
          key={complaint._id}
          position={[complaint.location.latitude, complaint.location.longitude]}
        >
          <Popup>
            <div className="text-slate-800">
              <h4 className="font-bold">{complaint.title}</h4>
              <p><strong>Status:</strong> {complaint.status}</p>
              <p><strong>Priority:</strong> {complaint.priority}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default StaffRouteMap;
