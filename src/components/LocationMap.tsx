import { useState } from 'react';
import { Box, UnstyledButton } from '@mantine/core';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { ResponsiveModal } from '@/components/ResponsiveModal';

// Bundlers break Leaflet's default marker icon (it resolves image URLs relative
// to the CSS file, which doesn't exist post-bundle), so point it at the bundled assets.
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
  /** Shown as the title of the enlarged map, e.g. the customer's name. */
  label?: string;
};

// A small static preview; clicking it opens a larger, fully interactive map.
export const LocationMap = ({ lat, lng, label }: LocationMapProps) => {
  const [opened, setOpened] = useState(false);
  const position: [number, number] = [lat, lng];

  return (
    <>
      <UnstyledButton
        onClick={() => setOpened(true)}
        w="100%"
        aria-label={`Open the map${label ? ` for ${label}` : ''}`}
      >
        <Box
          h={160}
          style={{
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid var(--ldg-border)',
            pointerEvents: 'none',
            position: 'relative',
            zIndex: 0,
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
      <ResponsiveModal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Location"
        subtitle={label}
        width={720}
      >
        <Box p={20}>
          <Box
            h={440}
            style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--ldg-border)' }}
          >
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
        </Box>
      </ResponsiveModal>
    </>
  );
};
