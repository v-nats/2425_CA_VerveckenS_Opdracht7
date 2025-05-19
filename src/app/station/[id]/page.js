'use client';

import { useEffect, useState } from 'react';

export default function StationDetail({ params }) {
  const { id } = params;
  const [station, setStation] = useState(null);

  useEffect(() => {
    fetch('https://api.citybik.es/v2/networks/velo-antwerpen')
      .then(res => res.json())
      .then(data => {
        const found = data.network.stations.find(s => s.id === id);
        setStation(found);
      });
  }, [id]);

  if (!station) return <p style={{ padding: 20, fontSize: 18 }}>Loading...</p>;

  const { name, empty_slots, free_bikes } = station;
  const maxBikes = 20;
  const intensity = Math.min(free_bikes / maxBikes, 1);

  const size = 120 + intensity * 100; // 120px tot 220px
  const color = `hsl(${intensity * 120}, 80%, 50%)`; // rood (weinig) → groen (veel)

  return (
    <main
      style={{
        padding: 20,
        maxWidth: 480,
        margin: '0 auto',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>{name}</h1>
      <h2 style={{ fontSize: 18, color: '#555', marginBottom: 30 }}>
        Details per station
      </h2>

      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 30,
          fontSize: 16,
          fontWeight: '600',
        }}
      >
        <div>
          <p style={{ margin: 0, color: '#333' }}>Beschikbare fietsen</p>
          <p
            style={{
              fontSize: 22,
              color,
              marginTop: 5,
              fontWeight: '700',
              textAlign: 'center',
            }}
          >
            {free_bikes}
          </p>
        </div>
        <div>
          <p style={{ margin: 0, color: '#333' }}>Lege plaatsen</p>
          <p
            style={{
              fontSize: 22,
              color: '#777',
              marginTop: 5,
              fontWeight: '700',
              textAlign: 'center',
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
        }}
      />
    </main>
  );
}