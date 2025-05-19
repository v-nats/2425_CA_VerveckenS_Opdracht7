'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    fetch('https://api.citybik.es/v2/networks/velo-antwerpen')
      .then(res => res.json())
      .then(data => {
        // Selecteer 3 specifieke stations of de eerste 3
        const selectie = data.network.stations.slice(0, 3);
        setStations(selectie);
      });
  }, []);

  return (
    <main
      style={{
        padding: 20,
        maxWidth: 480,
        margin: '0 auto',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>Velo Antwerpen</h1>
      <p style={{ fontSize: 16, color: '#555', marginBottom: 30 }}>
        Creatieve stadsvisualisatie – klik op een station
      </p>

      <section
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-end',
          height: 240,
          marginBottom: 40,
        }}
      >
        {stations.map((station) => {
          const maxBikes = 20;
          const intensity = 1 - Math.min(station.free_bikes / maxBikes, 1); // minder fietsen → meer intensiteit
          const height = 60 + intensity * 140; // hoogte 60–200px
          const color = `hsl(${intensity * 0 + (1 - intensity) * 120}, 80%, 50%)`; // rood → groen

          return (
            <Link
              key={station.id}
              href={`/station/${station.id}`}
              style={{
                textAlign: 'center',
                textDecoration: 'none',
                color: '#333',
              }}
            >
              <div
                style={{
                  backgroundColor: color,
                  height,
                  width: 70,
                  borderRadius: '0 0 35px 35px',
                  margin: '0 auto',
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 12px rgba(0,0,0,0.2)`,
                }}
              ></div>
              <p style={{ marginTop: 10, fontSize: 14 }}>{station.name}</p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
