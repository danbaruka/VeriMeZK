# VeriMeZK Environment Variables

Copy this file to `.env.local` and fill in your values.

## Midnight Network Configuration

```env
VITE_MIDNIGHT_NETWORK_ID=1
VITE_MIDNIGHT_RPC_URL=https://midnight-rpc.example.com
VITE_MIDNIGHT_INDEXER_URL=https://midnight-indexer.example.com
```

## Cardano Network Configuration

```env
VITE_CARDANO_NETWORK=testnet
```

## Contract Configuration

```env
VITE_CONTRACT_ADDRESS=
```

## Application Configuration

```env
VITE_APP_NAME=VeriMeZK
VITE_APP_VERSION=0.1.0
VITE_LANDING_PAGE_URL=https://verimezk.org
```

## GitHub Configuration

```env
VITE_GITHUB_REPO_URL=https://github.com/danbaruka/VeriMeZK
VITE_GITHUB_ORG_URL=https://github.com/UPTODATE-DEV
```

## Links Configuration

```env
VITE_MIDNIGHT_NETWORK_URL=https://midnight.network
VITE_DOCS_URL=https://docs.verimezk.org
```

## API Endpoints (optional)

```env
VITE_API_ENDPOINTS=
```

## Feature Flags

```env
# Enable Midnight SDK integration (default: false)
VITE_ENABLE_MIDNIGHT_SDK=false

# Enable face recognition (default: true)
VITE_ENABLE_FACE_RECOGNITION=true
```

## Notes

- Never commit `.env.local` to version control
- Use `.env.example` as a template
- All variables must be prefixed with `VITE_` to be accessible in the app
- Restart the dev server after changing environment variables
- Optional variables can be omitted (defaults will be used)

