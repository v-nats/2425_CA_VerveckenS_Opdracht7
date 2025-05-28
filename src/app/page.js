
'use client'; 

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic'; 




const DynamicVeloHeatmap = dynamic(() => import('./components/VeloHeatmap'), {
  ssr: false, 
  loading: () => <p>Kaart aan het laden...</p>, 
});


export default function Home() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    
    const centralAntwerpLat = 51.2210; 
    const centralAntwerpLon = 4.3997;  

    
    
    const minDistanceBetweenSelectedStationsKm = 0.75; 

    
    
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    };

    
    fetch('https://api.citybik.es/v2/networks/velo-antwerpen')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        
        const stationsWithDistanceToCenter = data.network.stations.map(station => ({
            ...station,
            distanceToCenter: calculateDistance(
                centralAntwerpLat,
                centralAntwerpLon,
                station.latitude,
                station.longitude
            )
        }));

        
        stationsWithDistanceToCenter.sort((a, b) => a.distanceToCenter - b.distanceToCenter);

        const closestFiveStations = [];
        
        for (const station of stationsWithDistanceToCenter) {
          if (closestFiveStations.length >= 5) {
            break;
          }

          let isTooCloseToExisting = false;
          for (const selectedStation of closestFiveStations) {
            const distanceBetween = calculateDistance(
              station.latitude,
              station.longitude,
              selectedStation.latitude,
              selectedStation.longitude
            );
            if (distanceBetween < minDistanceBetweenSelectedStationsKm) {
              isTooCloseToExisting = true;
              break;
            }
          }

          if (!isTooCloseToExisting) {
            closestFiveStations.push(station);
          }
        }
        
        setStations(closestFiveStations);
        setLoading(false);
      })
      .catch(e => {
        console.error('Error fetching data:', e); 
        setError(e.message);
        setLoading(false);
      });
  }, []); 

  return (
    <main
      style={{
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}
    >
      <h1 style={{ fontSize: '28px', marginBottom: '0' }}>Velo Antwerpen Heatmap</h1>
      <p style={{ fontSize: '16px', color: '#555', marginBottom: '20px', textAlign: 'center' }}>
        Visualisatie van real-time beschikbare Velo fietsen. Groen = veel fietsen, Rood = weinig fietsen.
      </p>

      {loading && (
  <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <div className="spinner" />
    <p>Velo-data wordt geladen...</p>
  </div>
)}
      {error && <p style={{ color: 'red' }}>Fout bij het laden van data: {error}</p>}

      
      {!loading && !error && (
        <DynamicVeloHeatmap stations={stations} />
      )}

      
      {!loading && !error && stations.length > 0 && (
        <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px', width: '100%' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '15px', textAlign: 'center' }}>Dichtstbijzijnde Stations (Top 5, verspreid)</h2>
          <ul style={{ listStyle: 'none', padding: '0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
            {stations.map(station => (
              <li
                key={station.id}
                style={{
                  background: '#f9f9f9',
                  padding: '15px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderLeft: `5px solid ${station.free_bikes > 5 ? '#4CAF50' : station.free_bikes > 0 ? '#FFC107' : '#F44336'}`
                }}
              >
                <strong style={{ fontSize: '18px', display: 'block', marginBottom: '5px' }}>{station.name}</strong>
                <p style={{ margin: '0', fontSize: '14px', color: '#333' }}>
                  Vrije fietsen: <span style={{ fontWeight: 'bold' }}>{station.free_bikes}</span>
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: '#333' }}>
                  Lege plaatsen: <span style={{ fontWeight: 'bold' }}>{station.empty_slots}</span>
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                  Afstand tot centrum: <span style={{ fontStyle: 'italic' }}>{station.distanceToCenter.toFixed(2)} km</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
