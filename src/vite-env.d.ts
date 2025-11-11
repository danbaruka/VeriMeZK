/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MIDNIGHT_NETWORK_ID: string;
  readonly VITE_MIDNIGHT_RPC_URL: string;
  readonly VITE_MIDNIGHT_INDEXER_URL: string;
  readonly VITE_CARDANO_NETWORK: string;
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_API_ENDPOINTS: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_LANDING_PAGE_URL?: string;
  readonly VITE_GITHUB_REPO_URL?: string;
  readonly VITE_GITHUB_ORG_URL?: string;
  readonly VITE_MIDNIGHT_NETWORK_URL?: string;
  readonly VITE_ENABLE_MIDNIGHT_SDK?: string;
  readonly VITE_ENABLE_FACE_RECOGNITION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

