// src/app/components/VeloHeatmap.js
'use client'; // Deze component MOET een client component zijn

import { useEffect, useMemo, useRef } from 'react'; // useRef toegevoegd
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'; // useMap toegevoegd
import 'leaflet/dist/leaflet.css'; // Essentieel voor de styling van de kaart
import L from 'leaflet'; // Importeer L voor de heatmap plugin
import 'leaflet.heat'; // Importeer de Leaflet.heat plugin

// BELANGRIJKE FIX: Dit lost problemen op met ontbrekende marker-iconen in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component om de heatmap laag toe te voegen aan de Leaflet kaart
function HeatmapLayer({ heatmapData }) {
  const map = useMap(); // Haal de Leaflet map instantie op via useMap hook

  useEffect(() => {
    if (!map || heatmapData.length === 0) {
      return; // Doe niets als de kaart of data ontbreekt
    }

    // Verwijder de vorige heatmap laag als die bestaat
    if (map._heatmapLayer) {
      map.removeLayer(map._heatmapLayer);
    }

    const heatLayer = L.heatLayer(heatmapData, {
        radius: 80,
        blur: 20,
        maxZoom: 1,
        minOpacity: 0.4,
        max: 1, // Blijft op 1
        gradient: {
          0.0: 'red', 
            // 0-20% van max (0-4 fietsen)
          0.3: 'orange',  // 30% van max (6 fietsen)
          0.6: 'yellow',  // 60% van max (12 fietsen)
          0.9: 'green'    // 90% van max (18 fietsen)
        }
      });

    heatLayer.addTo(map);
    map._heatmapLayer = heatLayer; // Sla de laag op in de map instantie voor eenvoudige referentie

    // Cleanup functie: verwijder de heatmap laag wanneer de component unmount
    return () => {
      if (map._heatmapLayer) {
        map.removeLayer(map._heatmapLayer);
        map._heatmapLayer = null; // Verwijder de referentie
      }
    };
  }, [map, heatmapData]); // Herhaal dit effect wanneer map of heatmapData verandert

  return null; // Deze component rendert geen UI-elementen direct
}

const VeloHeatmap = ({ stations }) => {
  const defaultAntwerpLocation = [51.219448, 4.402464];
  const initialZoom = 13;

  const heatmapData = useMemo(() => {
    const maxBikesPerStation = 19; // pas aan indien nodig
    return stations.map(station => {
      const ratio = station.free_bikes / maxBikesPerStation;
      const intensity = Math.min(ratio, 1); // cap op 1
      console.log(`Station: ${station.name}, Free Bikes: ${station.free_bikes}, Intensity: ${intensity}`); // <--- VOEG DEZE TOE
      return [station.latitude, station.longitude, intensity];
    });
    console.log('Final Heatmap Data:', transformedData); // <--- EN DEZE
  }, [stations]);
  
  return (
    <MapContainer
      center={defaultAntwerpLocation}
      zoom={initialZoom}
      scrollWheelZoom={true}
      className="leaflet-container" // Gebruikt de CSS class vanuit globals.css
    >
     <TileLayer
  attribution="" // Geen attributie nodig voor een lege tegel
  url="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" // Transparante 1x1 GIF
/>

      {/* Render de HeatmapLayer component met de voorbereide data */}
      <HeatmapLayer heatmapData={heatmapData} />

      {/* Markers voor elk station met popup-informatie */}
      {stations.map(station => (
        <Marker key={station.id} position={[station.latitude, station.longitude]}>
          <Popup>
  <div style={{ fontSize: '14px', lineHeight: '1.4', textAlign: 'center' }}>
    <strong>{station.name}</strong><br />
    🚴 {station.free_bikes} fietsen<br />
    📍 {station.empty_slots} plaatsen<br />
    <a href={`/station/${station.id}`} style={{
      display: 'inline-block',
      marginTop: '8px',
      padding: '6px 10px',
      background: '#007bff',
      color: 'white',
      borderRadius: '6px',
      textDecoration: 'none',
      fontSize: '12px'
    }}>Details</a>
  </div>
</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default VeloHeatmap;