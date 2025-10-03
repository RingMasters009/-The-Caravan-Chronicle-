import React, { useState } from 'react';

export default function ComplaintForm({ onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    setFile(e.target.files[0] || null);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude.toString());
        setLng(pos.coords.longitude.toString());
      },
      err => alert(err.message || 'Failed to get location')
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      if (file) fd.append('photo', file);
      if (lat) fd.append('lat', lat);
      if (lng) fd.append('lng', lng);

      const res = await fetch('http://localhost:3000/api/complaints', {
        method: 'POST',
        body: fd
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server returned invalid JSON:\n' + text);
      }

      if (!res.ok) throw new Error(data.error || 'Submit failed');

      setTitle(''); setDescription(''); setFile(null); setLat(''); setLng('');
      if (onSuccess) onSuccess(data.complaint);
      alert('Complaint submitted successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{
        maxWidth: 600, 
        margin: '20px auto', 
        padding: 20, 
        backgroundColor: '#f9f9f9', 
        borderRadius: 12, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Submit a Complaint</h2>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Title</label>
        <input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
          style={{
            width: '100%', 
            padding: '10px', 
            borderRadius: 6, 
            border: '1px solid #ccc', 
            fontSize: 14
          }} 
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Description</label>
        <textarea 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          rows={4}
          style={{
            width: '100%', 
            padding: '10px', 
            borderRadius: 6, 
            border: '1px solid #ccc', 
            fontSize: 14
          }}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Photo (optional)</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          style={{ fontSize: 14 }}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Location</label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <input 
            placeholder="Latitude" 
            value={lat} 
            onChange={e => setLat(e.target.value)} 
            style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }}
          />
          <input 
            placeholder="Longitude" 
            value={lng} 
            onChange={e => setLng(e.target.value)} 
            style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }}
          />
          <button 
            type="button" 
            onClick={useMyLocation} 
            style={{ padding: '8px 12px', borderRadius: 6, border: 'none', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer' }}
          >
            Use my location
          </button>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading} 
        style={{
          width: '100%', 
          padding: '12px', 
          borderRadius: 6, 
          border: 'none', 
          backgroundColor: '#28a745', 
          color: '#fff', 
          fontSize: 16, 
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Submitting...' : 'Submit Complaint'}
      </button>

      {error && <div style={{color:'red', marginTop: 10, textAlign:'center'}}>{error}</div>}
    </form>
  );
}
