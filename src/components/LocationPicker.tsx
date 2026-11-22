import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { IconCurrentLocation, IconMapPinOff, IconSearch } from '@tabler/icons-react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { CustomerType } from '@/store/customerSlice/customerSlice';
import { pinIcon } from '@/components/mapPin';

export type LatLng = { lat: number; lng: number };
type Place = { name: string; detail: string; point: LatLng };

const DEFAULT_CENTER: LatLng = { lat: 7.8731, lng: 80.7718 }; // Sri Lanka
const SRI_LANKA_BBOX = '79.4,5.8,82.0,9.95';

// Photon (OpenStreetMap data) is built for search-as-you-type; the public Nominatim forbids it.
// ponytail: public photon.komoot.io is fair-use only; self-host Photon or use Google Places if traffic grows.
const searchPlaces = async (q: string, signal: AbortSignal): Promise<Place[]> => {
  const url = `https://photon.komoot.io/api/?${new URLSearchParams({ q, limit: '8', lang: 'en', bbox: SRI_LANKA_BBOX })}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const json = (await res.json()) as {
    features?: { properties?: Record<string, unknown>; geometry?: { coordinates?: number[] } }[];
  };
  const out: Place[] = [];
  for (const f of json.features ?? []) {
    const c = f.geometry?.coordinates;
    if (!c || c.length < 2) continue;
    const s = (k: string) => {
      const v = f.properties?.[k];
      return typeof v === 'string' && v.trim() ? v.trim() : undefined;
    };
    const street = [s('housenumber'), s('street')].filter(Boolean).join(' ');
    const parts = [
      ...new Set(
        [street, s('district'), s('city'), s('county'), s('state')].filter(Boolean) as string[],
      ),
    ];
    const name = s('name') ?? (street || parts[0]);
    if (!name) continue;
    out.push({
      name,
      detail: parts.filter((p) => p !== name).join(', ') || 'Sri Lanka',
      point: { lat: c[1], lng: c[0] },
    });
  }
  return out;
};

const Clicks = ({ onPick }: { onPick: (p: LatLng) => void }) => {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
};

// Re-centres the map when the pin is moved from outside (search result, "use my location").
const Follow = ({ point, zoom }: { point: LatLng | null; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    if (point) map.setView([point.lat, point.lng], zoom);
  }, [map, point, zoom]);
  return null;
};

type Props = {
  value: LatLng | null;
  onChange: (v: LatLng | null) => void;
  customerType?: CustomerType;
};

// Set a customer's location: type to search places (results show while typing), click the map or
// drag the pin, or use this device's location. Coordinates only; the server derives the h3 index.
export const LocationPicker = ({ value, onChange, customerType = 'HARDWARE_STORE' }: Props) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [notice, setNotice] = useState('');
  const [followKey, setFollowKey] = useState<LatLng | null>(value); // only moves the camera on explicit picks
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    abort.current?.abort();
    const q = query.trim();
    if (q.length < 2) return;
    const ctrl = new AbortController();
    abort.current = ctrl;
    const t = setTimeout(async () => {
      setSearching(true);
      setNotice('');
      try {
        setResults(await searchPlaces(q, ctrl.signal));
      } catch (e) {
        if (!ctrl.signal.aborted) {
          setNotice("Couldn't search places. Check the connection, or click the map.");
          void e;
        }
      } finally {
        if (!ctrl.signal.aborted) setSearching(false);
      }
    }, 350);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  const active = query.trim().length >= 2; // stale results/spinner are hidden once the box is cleared
  const place = (p: LatLng, zoom = true) => {
    onChange(p);
    if (zoom) setFollowKey({ ...p });
  };

  const useMyLocation = () => {
    setNotice('');
    if (!navigator.geolocation)
      return setNotice("This browser can't share its location. Click the map instead.");
    navigator.geolocation.getCurrentPosition(
      (pos) => place({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setNotice('Location permission was denied. Click the map to place the pin instead.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const center = value ?? DEFAULT_CENTER;
  return (
    <Stack gap="xs">
      <TextInput
        label="Location"
        description="Search for a place, then fine-tune by clicking the map or dragging the pin."
        placeholder="Search for a place or address"
        leftSection={<IconSearch size={16} aria-hidden />}
        rightSection={active && searching ? <Loader size={14} /> : undefined}
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} // Enter must not submit the customer form
        aria-controls="location-results"
      />
      {active && results && (
        <Box
          id="location-results"
          role="listbox"
          aria-label="Place suggestions"
          style={{
            border: '1px solid var(--ldg-border)',
            borderRadius: 8,
            background: 'var(--ldg-surface-raised)',
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {results.length === 0 ? (
            <Text size="sm" c="dimmed" p="sm">
              No places found. Try another spelling, or click the map.
            </Text>
          ) : (
            results.map((r, i) => (
              <UnstyledButton
                key={`${r.point.lat},${r.point.lng},${i}`}
                role="option"
                aria-selected={false}
                w="100%"
                px="sm"
                py={8}
                style={{ display: 'block', borderBottom: '1px solid var(--ldg-border)' }}
                onClick={() => {
                  place(r.point);
                  setResults(null);
                  setQuery(r.name);
                }}
              >
                <Text size="sm" fw={500}>
                  {r.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {r.detail}
                </Text>
              </UnstyledButton>
            ))
          )}
        </Box>
      )}
      {notice && (
        <Alert color="yellow" variant="light" p="xs">
          {notice}
        </Alert>
      )}
      <Box
        h={260}
        style={{
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid var(--ldg-border)',
          position: 'relative',
          zIndex: 0, // keep Leaflet's panes below modals and popovers
        }}
      >
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={value ? 16 : 8}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Clicks onPick={(p) => place(p, false)} />
          <Follow point={followKey} zoom={17} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={pinIcon(customerType)}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const ll = (e.target as L.Marker).getLatLng();
                  place({ lat: ll.lat, lng: ll.lng }, false);
                },
              }}
            />
          )}
        </MapContainer>
      </Box>
      <Group justify="space-between" gap="xs">
        <Text size="sm" className="num" c={value ? undefined : 'dimmed'} aria-live="polite">
          {value ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : 'No location set'}
        </Text>
        <Group gap="xs">
          <Button
            variant="default"
            size="xs"
            leftSection={<IconCurrentLocation size={14} aria-hidden />}
            onClick={useMyLocation}
          >
            Use my location
          </Button>
          {value && (
            <Button
              variant="default"
              size="xs"
              leftSection={<IconMapPinOff size={14} aria-hidden />}
              onClick={() => {
                onChange(null);
                setFollowKey(null);
              }}
            >
              Clear
            </Button>
          )}
        </Group>
      </Group>
    </Stack>
  );
};
