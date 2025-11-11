// Configuration loader
export const config = {
  midnight: {
    networkId: import.meta.env.VITE_MIDNIGHT_NETWORK_ID || '1',
    rpcUrl: import.meta.env.VITE_MIDNIGHT_RPC_URL || '',
    indexerUrl: import.meta.env.VITE_MIDNIGHT_INDEXER_URL || '',
  },
  cardano: {
    network: import.meta.env.VITE_CARDANO_NETWORK || 'testnet',
  },
  contract: {
    address: import.meta.env.VITE_CONTRACT_ADDRESS || '',
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'VeriMeZK',
    version: import.meta.env.VITE_APP_VERSION || '0.1.0',
    landingPageUrl: import.meta.env.VITE_LANDING_PAGE_URL || 'https://verimezk.org',
  },
  github: {
    repoUrl: import.meta.env.VITE_GITHUB_REPO_URL || 'https://github.com/danbaruka/VeriMeZK',
    orgUrl: import.meta.env.VITE_GITHUB_ORG_URL || 'https://github.com/UPTODATE-DEV',
  },
  links: {
    midnightNetwork: import.meta.env.VITE_MIDNIGHT_NETWORK_URL || 'https://midnight.network',
    documentation: import.meta.env.VITE_DOCS_URL || 'https://docs.verimezk.org',
  },
  api: {
    endpoints: import.meta.env.VITE_API_ENDPOINTS || '',
  },
  features: {
    enableMidnightSDK: import.meta.env.VITE_ENABLE_MIDNIGHT_SDK === 'true',
    enableFaceRecognition: import.meta.env.VITE_ENABLE_FACE_RECOGNITION !== 'false',
  },
};

export default config;

