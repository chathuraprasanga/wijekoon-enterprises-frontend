import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { RouterProvider } from 'react-router-dom';

// Mantine's CSS must load before index.css: Tailwind preflight is disabled,
// and Tailwind utilities are imported second so they win same-specificity
// ties against Mantine's component styles by source order.
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

import { store } from './store/store';
import { theme } from './theme';
import { router } from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <Notifications />
        <RouterProvider router={router} />
      </MantineProvider>
    </Provider>
  </StrictMode>,
);
