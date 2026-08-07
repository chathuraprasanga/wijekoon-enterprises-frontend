import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { logClientUp } from './utils/client-log.util.ts';

// Prints the startup banner (project/version/env/API base) once the dev server is listening.
function printClientBanner(mode: string, baseUrl: string): Plugin {
  return {
    name: 'print-client-banner',
    configureServer(server) {
      const printUrls = server.printUrls.bind(server);
      server.printUrls = () => {
        printUrls();
        logClientUp(mode, baseUrl);
      };
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // `BASE_URL` collides with Vite's own reserved import.meta.env.BASE_URL
  // (tied to the `base` build option), so it's loaded manually here and
  // exposed to the client under a distinct key instead.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), printClientBanner(mode, env.BASE_URL)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    define: {
      'import.meta.env.APP_BASE_URL': JSON.stringify(env.BASE_URL),
    },
  };
});
