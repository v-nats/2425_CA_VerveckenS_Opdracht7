// app/station/[id]/page.js
'use client';

import { useEffect, useState } from 'react';

export default function StationDetail({ params }) {
  const { id } = params;
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://api.citybik.es/v2/networks/velo-antwerpen')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        const found = data.network.stations.find(s => s.id === id);
        if (found) {
          setStation(found);
        } else {
          setError('Station niet gevonden.');
        }
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p style={{ padding: '20px', fontSize: '18px' }}>Laden van station details...</p>;
  if (error) return <p style={{ padding: '20px', fontSize: '18px', color: 'red' }}>Fout: {error}</p>;
  if (!station) return <p style={{ padding: '20px', fontSize: '18px' }}>Station details niet beschikbaar.</p>;

  const { name, empty_slots, free_bikes } = station;
  const maxBikes = 20;
  const intensity = Math.min(free_bikes / maxBikes, 1);

  const hue = intensity * 120;
  const color = `hsl(${hue}, 80%, 50%)`;

  const size = 120 + intensity * 100;

  return (
    <main
      style={{
        padding: '20px',
        maxWidth: '480px',
        margin: '0 auto',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>{name}</h1>
      <h2 style={{ fontSize: '18px', color: '#555', marginBottom: '30px' }}>
        Details per station
      </h2>

      <section
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginBottom: '30px',
          fontSize: '16px',
          fontWeight: '600',
        }}
      >
        <div>
          <p style={{ margin: '0', color: '#333' }}>Beschikbare fietsen</p>
          <p
            style={{
              fontSize: '22px',
              color: color,
              marginTop: '5px',
              fontWeight: '700',
            }}
          >
            {free_bikes}
          </p>
        </div>
        <div>
          <p style={{ margin: '0', color: '#333' }}>Lege plaatsen</p>
          <p
            style={{
              fontSize: '22px',
              color: '#777',
              marginTop: '5px',
              fontWeight: '700',
            }}
          >
            {empty_slots}
          </p>
        </div>
      </section>

      <div
        aria-label="Warmtecirkel aantal fietsen"
        role="img"
        style={{
          backgroundColor: color,
          height: size,
          width: size,
          borderRadius: '50%',
          margin: '0 auto',
          boxShadow: `0 0 15px ${color}`,
          transition: 'all 0.5s ease',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '32px',
          fontWeight: 'bold',
        }}
      >
        {free_bikes}
      </div>
       <p style={{marginTop: '20px', fontSize: '14px', color: '#666'}}>
        {free_bikes} beschikbare fietsen op dit moment.
      </p>
    </main>
  );
}