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

## API Endpoints (optional)

```env
VITE_API_ENDPOINTS=
```

## Application Configuration

```env
VITE_APP_NAME=VeriMeZK
```

## Notes

- Never commit `.env.local` to version control
- Use `.env.example` as a template
- All variables must be prefixed with `VITE_` to be accessible in the app
- Restart the dev server after changing environment variables

