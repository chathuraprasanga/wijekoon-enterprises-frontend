import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

// Mantine's CSS must load before index.css: Tailwind preflight is disabled,
// and Tailwind utilities are imported second so they win same-specificity
// ties against Mantine's component styles by source order.
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';
// mantine-datatable's CSS lives in the `mantine-datatable` cascade layer, whose
// priority is fixed by that layer name's first appearance in the whole document —
// not by where its rules physically live. index.css's `@layer mantine, mantine-datatable;`
// registers that name (with higher priority than Tailwind's own theme/base/components/
// utilities layers) — this import must come after index.css so that registration
// happens first, otherwise the layer ends up lower-priority than Tailwind's preflight
// (`base` layer), which silently strips borders/hover styles via `border-width: 0`.
import 'mantine-datatable/styles.layer.css';

import { App } from './App';
import theme from '@/theme.ts';
import { store } from '@/store/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Notifications position="top-right" />
        <App />
      </MantineProvider>
    </Provider>
  </StrictMode>,
);
