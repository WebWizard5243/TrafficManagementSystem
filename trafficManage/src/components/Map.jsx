import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TOMTOM_KEY = import.meta.env.VITE_TOM_TOM_API_KEY;
const center = [20.296, 85.8246];
const MIN_ZOOM_FOR_SIGNALS = 13;
const MAX_SIGNALS = 500;

// Signal marker icon
const signalIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 12px; height: 12px;
    background: #DB4437;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 4px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// Component to handle map events + traffic layer
function MapController({ onBoundsChange, searchQuery, setBbox }) {
  const map = useMap();
  const debounceTimer = useRef(null);

  useEffect(() => {
    const trafficLayer = L.tileLayer(
      `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`,
      { opacity: 0.8, zIndex: 10 },
    );
    trafficLayer.addTo(map);
    return () => map.removeLayer(trafficLayer);
  }, [map]);

  useEffect(() => {
    const handleMoveEnd = () => {
      // Clear previous timer on every move
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      // Only fire after user stops moving for 1 second
      debounceTimer.current = setTimeout(() => {
        const zoom = map.getZoom();
        const bounds = map.getBounds();
        if (bounds) {
          const bbox = {
            minLon: Number(bounds.getWest().toFixed(2)),
            minLat: Number(bounds.getSouth().toFixed(2)),
            maxLon: Number(bounds.getEast().toFixed(2)),
            maxLat: Number(bounds.getNorth().toFixed(2)),
          };

          onBoundsChange({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
            zoom,
          });

          setBbox(bbox);
        }
      }, 2500); // 1 second delay
    };

    map.on("moveend", handleMoveEnd);
    return () => {
      map.off("moveend", handleMoveEnd);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [map, onBoundsChange]);

  useEffect(() => {
    if (!searchQuery) return;
    const search = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
          { headers: { "Accept-Language": "en" } },
        );
        const results = await res.json();
        if (results.length > 0) {
          const { lat, lon } = results[0];
          map.setView([parseFloat(lat), parseFloat(lon)], 16);
        }
      } catch (err) {
        console.error("Search error:", err);
      }
    };
    search();
  }, [searchQuery, map]);

  return null;
}

export default function Map({ data, alert }) {
  const navigate = useNavigate();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(13);
  const [loadingMessage, setLoadingMessage] = useState("");

  const signalCache = useRef({}); // cache results by area

  const handleBoundsChange = useCallback(
    async ({ north, south, east, west, zoom }) => {
      setZoom(zoom);
      if (zoom < MIN_ZOOM_FOR_SIGNALS) {
        setSignals([]);
        return;
      }

      const key = `${south.toFixed(2)},${west.toFixed(2)},${north.toFixed(2)},${east.toFixed(2)}`;
      if (signalCache.current[key]) {
        setSignals(signalCache.current[key]);
        return;
      }

      try {
        setLoadingMessage("");
        setLoading(true);
        const res = await fetch(
          `https://overpass-api.de/api/interpreter?data=[out:json];node["highway"="traffic_signals"](${south},${west},${north},${east});out;`,
        );
        const json = await res.json();
        let fetched = json.elements || [];
        if (fetched.length > MAX_SIGNALS)
          fetched = fetched.slice(0, MAX_SIGNALS);
        signalCache.current[key] = fetched;

        setSignals(fetched);
      } catch (err) {
        console.error("Error fetching signals:", err);
        setSignals([]);
        setLoadingMessage(
          "Traffic signal server is busy, try again in a moment.",
        );
        setTimeout(() => setLoadingMessage(""), 10000);
      } finally {
        setLoading(false);
      }
    },
    [],
  );
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
      >
        {/* TomTom Base Map */}
        <TileLayer
          url={`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`}
          attribution="&copy; TomTom"
          maxZoom={22}
        />

        <MapController
          onBoundsChange={handleBoundsChange}
          searchQuery={data}
          setBbox={alert}
        />

        {/* Traffic Signal Markers */}
        {signals.map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lon]}
            icon={signalIcon}
            eventHandlers={{
              click: () => navigate("/Monitoring"),
            }}
          >
            <Popup>Traffic Signal</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Status overlays */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 999,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "8px 12px",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          Loading signals...
        </div>
      )}
      {loadingMessage && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 999,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "8px 12px",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {loadingMessage}
        </div>
      )}

      {zoom < MIN_ZOOM_FOR_SIGNALS && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 999,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "8px 12px",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          Zoom in to see traffic signals
        </div>
      )}
    </div>
  );
}
