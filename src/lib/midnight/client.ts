// Midnight SDK integration - optional, will use mock if packages unavailable
import type { MidnightProviders } from '@/types';
import { setupProviders } from './providers';

let MidnightSetupAPI: any = null;
let midnightAPI: any = null;
let providers: MidnightProviders | null = null;

// Lazy load Midnight SDK with proper error handling for missing packages
async function getMidnightSetupAPI() {
    if (MidnightSetupAPI) return MidnightSetupAPI;

    try {
        // Use dynamic import with string literal to prevent Vite from resolving at build time
        const moduleName = '@midnight-ntwrk/dapp-connector-api';
        const module = await import(/* @vite-ignore */ moduleName);
        MidnightSetupAPI = module.MidnightSetupAPI || module.default?.MidnightSetupAPI;
        return MidnightSetupAPI;
    } catch (error) {
        console.warn('Midnight SDK packages not available. Install @midnight-ntwrk packages when available.');
        return null;
    }
}

export async function getMidnightClient() {
    if (!providers) {
        providers = await setupProviders();
    }
    return providers;
}

export async function initializeMidnightAPI(contractInstance?: any, contractAddress?: string) {
    const API = await getMidnightSetupAPI();
    if (!API) {
        throw new Error('Midnight SDK not available. Please install @midnight-ntwrk packages.');
    }

    if (midnightAPI) {
        return midnightAPI;
    }

    const providers = await getMidnightClient();

    if (contractAddress) {
        // Join existing contract
        midnightAPI = await API.joinContract(
            providers,
            contractInstance,
            contractAddress
        );
    } else if (contractInstance) {
        // Deploy new contract
        midnightAPI = await API.deployContract(
            providers,
            contractInstance
        );
    } else {
        throw new Error('Either contractInstance or contractAddress must be provided');
    }

    return midnightAPI;
}

export async function getContractState() {
    if (!midnightAPI) {
        throw new Error('Midnight API not initialized');
    }
    return await midnightAPI.getContractState();
}

export function resetMidnightClient() {
    midnightAPI = null;
    providers = null;
}

