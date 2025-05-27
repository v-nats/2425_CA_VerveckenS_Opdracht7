// app/page.js
'use client'; // Dit bestand MOET aan de client-side worden gerenderd

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic'; // Importeer next/dynamic voor client-side only rendering

// Dynamische import van de VeloHeatmap component
const DynamicVeloHeatmap = dynamic(() => import('./components/VeloHeatmap'), {
  ssr: false, // Schakel Server-Side Rendering uit voor deze component
  loading: () => <p>Kaart aan het laden...</p>, // Optionele laadtekst terwijl de kaart laadt
});

// Hoofdcomponent van de pagina
export default function Home() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Coördinaten van het centrum van Antwerpen (bijvoorbeeld Grote Markt)
    // Je kunt deze aanpassen naar een preciezere locatie als je wilt
    const centralAntwerpLat = 51.2210; // Breedtegraad van de Grote Markt
    const centralAntwerpLon = 4.3997;  // Lengtegraad van de Grote Markt

    // Minimale afstand (in kilometers) die tussen de geselecteerde stations moet zijn
    // Pas deze waarde aan als je een grotere of kleinere spreiding wilt
    const minDistanceBetweenSelectedStationsKm = 0.75; // Bijvoorbeeld 0.75 km

    // Functie om de afstand tussen twee punten te berekenen (Haversine formule)
    // Dit geeft de afstand in kilometers
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Aarde straal in kilometers
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

    // Haal de data op van de Velo Antwerpen API
    fetch('https://api.citybik.es/v2/networks/velo-antwerpen')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        // Bereken de afstand van elk station tot het centrum van Antwerpen
        const stationsWithDistanceToCenter = data.network.stations.map(station => ({
            ...station,
            distanceToCenter: calculateDistance(
                centralAntwerpLat,
                centralAntwerpLon,
                station.latitude,
                station.longitude
            )
        }));

        // Sorteer alle stations op basis van hun afstand tot het centrum (oplopend)
        stationsWithDistanceToCenter.sort((a, b) => a.distanceToCenter - b.distanceToCenter);

        const closestFiveStations = [];
        // Loop door de gesorteerde stations en selecteer de 5 dichtstbijzijnde die voldoende ver uit elkaar liggen
        for (const station of stationsWithDistanceToCenter) {
          if (closestFiveStations.length >= 5) {
            break; // We hebben al 5 stations
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
        console.error('Error fetching data:', e); // Log de fout voor debugging
        setError(e.message);
        setLoading(false);
      });
  }, []); // Lege dependency array betekent dat dit effect slechts één keer draait bij mount

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

      {loading && <p>Bezig met laden van Velo Antwerpen data...</p>}
      {error && <p style={{ color: 'red' }}>Fout bij het laden van data: {error}</p>}

      {/* Render de dynamisch geladen kaartcomponent zodra data is geladen en er geen fout is */}
      {!loading && !error && (
        <DynamicVeloHeatmap stations={stations} />
      )}

      {/* Weergave van de lijst met de 5 dichtstbijzijnde stations die ook verspreid zijn */}
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
