# VeriMeZK Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   
   Create a `.env.local` file in the root directory with the following variables:
   
   ```env
   VITE_MIDNIGHT_NETWORK_ID=1
   VITE_MIDNIGHT_RPC_URL=https://your-midnight-rpc-url
   VITE_MIDNIGHT_INDEXER_URL=https://your-midnight-indexer-url
   VITE_CARDANO_NETWORK=testnet
   VITE_CONTRACT_ADDRESS=your-contract-address
   VITE_APP_NAME=VeriMeZK
   ```

3. **Setup Face Recognition Models** (Optional for MVP)
   
   Download face-api.js models from: https://github.com/justadudewhohacks/face-api.js-models
   
   Place the following files in `public/models/`:
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`
   - `face_recognition_model-shard2`

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   
   Navigate to `http://localhost:3356`

## Project Structure

```
VeriMeZK/
├── src/
│   ├── components/
│   │   ├── wallet/          # Wallet connection components
│   │   ├── scan/            # Document scanning components
│   │   ├── proof/           # ZK proof generation components
│   │   └── shared/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/
│   │   ├── midnight/        # Midnight SDK integration
│   │   ├── zk/              # ZK proof utilities
│   │   ├── camera/          # Camera utilities
│   │   └── biometric/       # Face recognition utilities
│   ├── contexts/            # React contexts
│   ├── types/               # TypeScript types
│   ├── utils/               # Helper functions
│   └── config/              # Configuration
├── public/
│   └── models/              # Face-api.js models
└── .env.local               # Environment variables (create this)
```

## Verification Flow

1. **Connect Wallet** → User connects Cardano wallet (Nami, Eternl, Flint)
2. **Scan Document** → Camera scans MRZ from passport/ID
3. **Face Verification** → Selfie capture and biometric matching
4. **Generate Proof** → Create ZK proof of identity attributes
5. **Sign Transaction** → Sign and submit proof to Midnight network

## Development Notes

- All environment variables must be prefixed with `VITE_` to be accessible
- Camera access requires HTTPS in production
- Face verification models are optional for MVP (simulated matching available)
- ZK proof generation is simulated for MVP (integrate Midnight Dust for production)

## Troubleshooting

**Camera not working**: Ensure HTTPS in production or use `localhost` in development

**Wallet connection fails**: Check that a Cardano wallet extension is installed

**Midnight SDK errors**: Verify environment variables are correctly set

**Face recognition not working**: Ensure models are placed in `public/models/` directory

