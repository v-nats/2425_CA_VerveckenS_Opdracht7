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
    // Haal de data op van de Velo Antwerpen API
    fetch('https://api.citybik.es/v2/networks/velo-antwerpen')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        // --- WIJZIGING HIER: FILTER VOOR SLECHTS 5 STATIONS ---
        // We nemen hier de eerste 5 stations uit de API-respons.
        // Als je specifieke stations wilt, kun je hier filters toevoegen op basis van ID of naam.
        const firstFiveStations = data.network.stations.slice(0, 5);
        setStations(firstFiveStations);
        // --- EINDE WIJZIGING ---

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

    </main>
  );
}