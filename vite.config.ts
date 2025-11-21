import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import { readFileSync, existsSync } from 'fs';

// Read package.json version at build time
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Get port from environment variable, fallback to default
const port = process.env.VITE_PORT ? parseInt(process.env.VITE_PORT, 10) : 3356;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  optimizeDeps: {
    exclude: [
      '@midnight-ntwrk/dapp-connector-api',
      '@midnight-ntwrk/midnight-js-fetch-zk-config-provider',
      '@midnight-ntwrk/midnight-js-http-client-proof-provider',
      '@midnight-ntwrk/midnight-js-indexer-public-data-provider',
      '@midnight-ntwrk/midnight-js-level-private-state-provider',
      '@midnight-ntwrk/midnight-js-network-id',
      '@midnight-ntwrk/ledger',
    ],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
    'import.meta.env.VITE_PACKAGE_VERSION': JSON.stringify(packageJson.version),
  },
  server: {
    port: port,
    host: '0.0.0.0', // Listen on all interfaces to detect all IPs
    strictPort: true, // Force to use the specified port
    // Enable HTTPS if certificates exist
    ...((): { https?: { key: Buffer; cert: Buffer } } => {
      const certPath = path.resolve(__dirname, './certs/cert.pem');
      const keyPath = path.resolve(__dirname, './certs/key.pem');

      if (existsSync(certPath) && existsSync(keyPath)) {
        console.log('🔐 HTTPS enabled - using certificates from ./certs/');
        return {
          https: {
            key: readFileSync(keyPath),
            cert: readFileSync(certPath),
          },
        };
      }

      // Fallback: Vite can auto-generate certificates, but they'll show warnings
      // Uncomment the line below to enable auto-generated HTTPS (with browser warnings)
      // return { https: true };

      return {};
    })(),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    cors: true,
    // Allow ngrok domains and demo.verimezk.org
    allowedHosts: [
      '.ngrok-free.app',
      '.ngrok.io',
      '.ngrok.app',
      'localhost',
      'demo.verimezk.org',
      '.verimezk.org',
    ],
  },
  preview: {
    port: port,
    host: '0.0.0.0',
    strictPort: true, // Force to use the specified port
    // Enable HTTPS if certificates exist
    ...((): { https?: { key: Buffer; cert: Buffer } } => {
      const certPath = path.resolve(__dirname, './certs/cert.pem');
      const keyPath = path.resolve(__dirname, './certs/key.pem');

      if (existsSync(certPath) && existsSync(keyPath)) {
        console.log('🔐 HTTPS enabled for preview - using certificates from ./certs/');
        return {
          https: {
            key: readFileSync(keyPath),
            cert: readFileSync(certPath),
          },
        };
      }

      return {};
    })(),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    cors: true,
    // Allow demo.verimezk.org and other domains
    allowedHosts: [
      '.ngrok-free.app',
      '.ngrok.io',
      '.ngrok.app',
      'localhost',
      'demo.verimezk.org',
      '.verimezk.org',
    ],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: [
        '@midnight-ntwrk/ledger',
        '@midnight-ntwrk/dapp-connector-api',
        '@midnight-ntwrk/compact-runtime',
        '@midnight-ntwrk/midnight-js-fetch-zk-config-provider',
        '@midnight-ntwrk/midnight-js-http-client-proof-provider',
        '@midnight-ntwrk/midnight-js-indexer-public-data-provider',
        '@midnight-ntwrk/midnight-js-level-private-state-provider',
        '@midnight-ntwrk/midnight-js-network-id',
      ],
      output: {
        manualChunks: {
          'mesh-sdk': ['@meshsdk/react', '@meshsdk/core'],
        },
      },
    },
  },
  worker: {
    format: 'es',
    plugins: () => [wasm(), topLevelAwait()],
  },
});

