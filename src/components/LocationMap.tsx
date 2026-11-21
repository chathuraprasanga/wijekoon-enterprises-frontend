import { useState } from 'react';
import { Box, UnstyledButton } from '@mantine/core';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import type { CustomerType } from '@/store/customerSlice/customerSlice';
import { pinIcon } from '@/components/mapPin';
import { ResponsiveModal } from '@/components/ResponsiveModal';

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export type LocationMapProps = {
  lat: number;
  lng: number;
  /** Shown as the title of the enlarged map, e.g. the customer's name. */
  label?: string;
  /** Picks the pin: person for individuals, storefront for hardware stores. */
  customerType?: CustomerType;
};

// A small static preview; clicking it opens a larger, fully interactive map.
export const LocationMap = ({
  lat,
  lng,
  label,
  customerType = 'HARDWARE_STORE',
}: LocationMapProps) => {
  const [opened, setOpened] = useState(false);
  const icon = pinIcon(customerType);
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
            <Marker position={position} icon={icon} />
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
              <Marker position={position} icon={icon} />
            </MapContainer>
          </Box>
        </Box>
      </ResponsiveModal>
    </>
  );
};
