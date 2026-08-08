import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

// Mantine's CSS must load before index.css: Tailwind preflight is disabled,
// and Tailwind utilities are imported second so they win same-specificity
// ties against Mantine's component styles by source order.
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

import { App } from './App';
import theme from '@/theme.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </StrictMode>,
);
