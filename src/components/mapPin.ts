import L from 'leaflet';
import type { CustomerType } from '@/store/customerSlice/customerSlice';

// Teardrop pin with a glyph: person (individual, forest green) or storefront (hardware store, amber).
// Inline SVG divIcons avoid Leaflet's default marker images, which bundlers break.
const GLYPHS: Record<CustomerType, string> = {
  INDIVIDUAL:
    '<circle cx="16" cy="12.5" r="3.6" fill="#fff"/><path d="M9.5 22c.8-3.6 3.5-5.4 6.5-5.4s5.7 1.8 6.5 5.4z" fill="#fff"/>',
  HARDWARE_STORE:
    '<path d="M8.5 11.2 10.2 7h11.6l1.7 4.2c0 1.3-1 2.3-2.2 2.3-.9 0-1.6-.5-2-1.2-.4.7-1.1 1.2-2 1.2h-.6c-.9 0-1.6-.5-2-1.200-.4.700-1.100 1.200-2 1.200-1.200 0-2.200-1-2.200-2.300z" fill="#fff"/><path d="M10 15.200h12V23H10z" fill="#fff"/><rect x="14.300" y="17.500" width="3.400" height="5.500" fill="CLR"/>',
};
const PIN_COLORS: Record<CustomerType, string> = {
  INDIVIDUAL: '#0f5c4f',
  HARDWARE_STORE: '#b45f06',
};

export const pinIcon = (type: CustomerType) =>
  L.divIcon({
    className: '',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
    html: `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M16 1C8 1 2 7 2 15c0 10 14 26 14 26s14-16 14-26C30 7 24 1 16 1z" fill="${PIN_COLORS[type]}" stroke="#fff" stroke-width="2"/><g transform="translate(0 0)">${GLYPHS[type].replace('CLR', PIN_COLORS[type])}</g></svg>`,
  });
