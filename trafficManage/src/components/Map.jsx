import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, TrafficLayer, Marker } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";

const center = { lat: 22.5744, lng: 88.3629 };
const mapContainerStyle = { width: "100%", height: "100%" };

// Configuration
const MIN_ZOOM_FOR_SIGNALS = 13; // Only show signals when zoomed in enough
const MAX_SIGNALS = 500; // Limit maximum number of signals to show

export default function Map({ data }) {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  
  const [signals, setSignals] = useState([]);
  const [currentZoom, setCurrentZoom] = useState(13);
  const [loading, setLoading] = useState(false);

  const handleLoad = (map) => {
    mapRef.current = map;
    setCurrentZoom(map.getZoom());
  };

  // Fetch signals for any given bounds with limits
  const fetchSignalsForBounds = async (bounds, zoom) => {
    // Don't load signals if zoomed out too much
    if (zoom < MIN_ZOOM_FOR_SIGNALS) {
      console.log("Zoom level too low, not loading signals");
      setSignals([]);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching signals for bounds at zoom level:", zoom);
      
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node["highway"="traffic_signals"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});out;`;
      const res = await fetch(overpassUrl);
      const data = await res.json();
      
      let signals = data.elements || [];
      
      // Limit the number of signals to prevent lag
      if (signals.length > MAX_SIGNALS) {
        console.log(`Too many signals (${signals.length}), limiting to ${MAX_SIGNALS}`);
        signals = signals.slice(0, MAX_SIGNALS);
      }
      
      setSignals(signals);
      console.log("Loaded", signals.length, "traffic signals");
    } catch (error) {
      console.error("Error fetching traffic signals:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle when map stops moving
  const handleMapIdle = () => {
    if (mapRef.current) {
      const zoom = mapRef.current.getZoom();
      setCurrentZoom(zoom);
      
      const b = mapRef.current.getBounds();
      if (b) {
        const ne = b.getNorthEast();
        const sw = b.getSouthWest();
        const bounds = {
          north: ne.lat(),
          east: ne.lng(),
          south: sw.lat(),
          west: sw.lng(),
        };
        
        fetchSignalsForBounds(bounds, zoom);
      }
    }
  };

  // Handle search
  useEffect(() => {
    async function searchPlace() {
      if (!data || !mapRef.current) return;
      if (!window.google || !window.google.maps) return;

      try {
        const { Place } = await window.google.maps.importLibrary("places");

        const request = {
          textQuery: data,
          fields: ["displayName", "location"],
        };

        const result = await Place.searchByText(request);

        if (result?.places?.length > 0) {
          const place = result.places[0];
          if (place.location) {
            mapRef.current.panTo(place.location);
            mapRef.current.setZoom(16); // Zoom in enough to show signals
          }
        }
      } catch (err) {
        console.error("Error in Place.searchByText:", err);
      }
    }

    searchPlace();
  }, [data]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        onLoad={handleLoad}
        onIdle={handleMapIdle}
        options={{
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
        }}
      >
        {signals.map((s) => (
          <Marker
            key={s.id}
            position={{ lat: s.lat, lng: s.lon }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: "#DB4437",
              fillOpacity: 1,
              strokeWeight: 1,
            }}
            onClick={() => {
              navigate("/Monitoring");
            }}
          />
        ))}

        <TrafficLayer autoUpdate />
      </GoogleMap>

      {/* Show status messages */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          Loading signals...
        </div>
      )}

      {currentZoom < MIN_ZOOM_FOR_SIGNALS && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          Zoom in to see traffic signals
        </div>
      )}
    </div>
  );
}