// Midnight SDK providers - optional, will fail gracefully if packages unavailable
import type { MidnightProviders } from '@/types';
import config from '@/config';

export async function setupProviders(): Promise<MidnightProviders> {
  try {
    // Use dynamic imports with vite-ignore to prevent build-time resolution
    const { FetchZkConfigProvider } = await import(/* @vite-ignore */ '@midnight-ntwrk/midnight-js-fetch-zk-config-provider');
    const { httpClientProofProvider } = await import(/* @vite-ignore */ '@midnight-ntwrk/midnight-js-http-client-proof-provider');
    const { indexerPublicDataProvider } = await import(/* @vite-ignore */ '@midnight-ntwrk/midnight-js-indexer-public-data-provider');
    const { levelPrivateStateProvider } = await import(/* @vite-ignore */ '@midnight-ntwrk/midnight-js-level-private-state-provider');
    const { networkId } = await import(/* @vite-ignore */ '@midnight-ntwrk/midnight-js-network-id');

    const zkConfigProvider = new FetchZkConfigProvider({
      zkConfigUrl: config.midnight.rpcUrl,
    });

    const proofProvider = httpClientProofProvider({
      proofServerUrl: config.midnight.rpcUrl,
    });

    const dataProvider = indexerPublicDataProvider({
      indexerUrl: config.midnight.indexerUrl,
    });

    const stateProvider = await levelPrivateStateProvider({
      dbName: 'verimezk-midnight-state',
    });

    const networkIdProvider = networkId(Number(config.midnight.networkId));

    return {
      zkConfigProvider,
      proofProvider,
      dataProvider,
      stateProvider,
      networkId: networkIdProvider,
    };
  } catch (error) {
    console.warn('Midnight SDK providers not available:', error);
    throw new Error('Midnight SDK packages not installed. Install optional dependencies when available.');
  }
}

