import { useState } from 'react';
import { Box, Modal, UnstyledButton } from '@mantine/core';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Bundlers break Leaflet's default marker icon (it resolves image URLs relative
// to the CSS file, which doesn't exist post-bundle) — point it at the bundled assets.
const markerIconDefault = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export type LocationMapProps = {
  lat: number;
  lng: number;
};

/// A small static-looking map preview; clicking it opens a larger, fully interactive view.
export const LocationMap = ({ lat, lng }: LocationMapProps) => {
  const [opened, setOpened] = useState(false);
  const position: [number, number] = [lat, lng];

  return (
    <>
      <UnstyledButton onClick={() => setOpened(true)} w="100%">
        <Box
          h={160}
          style={{
            borderRadius: 'var(--mantine-radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--mantine-color-default-border)',
            pointerEvents: 'none',
          }}
        >
          <MapContainer
            key={`preview-${lat}-${lng}`}
            center={position}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            dragging={false}
            touchZoom={false}
            doubleClickZoom={false}
            scrollWheelZoom={false}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url={TILE_URL} />
            <Marker position={position} icon={markerIconDefault} />
          </MapContainer>
        </Box>
      </UnstyledButton>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Location" size="lg" centered>
        <Box h={440} style={{ borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden' }}>
          <MapContainer
            key={`full-${lat}-${lng}`}
            center={position}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
            <Marker position={position} icon={markerIconDefault} />
          </MapContainer>
        </Box>
      </Modal>
    </>
  );
};
