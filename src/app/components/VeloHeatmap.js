
'use client'; 
import { useEffect, useMemo, useRef } from 'react'; 
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'; // useMap toegevoegd
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet'; 
import 'leaflet.heat'; 


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


function HeatmapLayer({ heatmapData }) {
  const map = useMap(); 

  useEffect(() => {
    if (!map || heatmapData.length === 0) {
      return; 
    }

    
    if (map._heatmapLayer) {
      map.removeLayer(map._heatmapLayer);
    }

    const heatLayer = L.heatLayer(heatmapData, {
        radius: 80,
        blur: 20,
        maxZoom: 1,
        minOpacity: 0.4,
        max: 1, 
        gradient: {
          0.0: 'red', 
            
          0.3: 'orange',  
          0.6: 'yellow',  
          0.9: 'green'    
        }
      });

    heatLayer.addTo(map);
    map._heatmapLayer = heatLayer; 

    
    return () => {
      if (map._heatmapLayer) {
        map.removeLayer(map._heatmapLayer);
        map._heatmapLayer = null;
      }
    };
  }, [map, heatmapData]); 

  return null; 
}

const VeloHeatmap = ({ stations }) => {
  const defaultAntwerpLocation = [51.219448, 4.402464];
  const initialZoom = 13;

  const heatmapData = useMemo(() => {
    const maxBikesPerStation = 19; 
    return stations.map(station => {
      const ratio = station.free_bikes / maxBikesPerStation;
      const intensity = Math.min(ratio, 1); 
      console.log(`Station: ${station.name}, Free Bikes: ${station.free_bikes}, Intensity: ${intensity}`); // <--- VOEG DEZE TOE
      return [station.latitude, station.longitude, intensity];
    });
    console.log('Final Heatmap Data:', transformedData); 
  }, [stations]);
  
  return (
    <MapContainer
      center={defaultAntwerpLocation}
      zoom={initialZoom}
      scrollWheelZoom={true}
      className="leaflet-container" 
    >
     <TileLayer
  attribution="" 
  url="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" // Transparante 1x1 GIF
/>

      {}
      <HeatmapLayer heatmapData={heatmapData} />

      
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