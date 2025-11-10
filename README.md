# VeriMe ZK

<div align="center">

**Zero-Knowledge Identity Proof Toolkit for Browser Environments**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/badge/bundle-~500KB-blue)](https://github.com)

*Privacy-preserving identity verification powered by zero-knowledge proofs*

</div>

---

## Overview

**VeriMe ZK** is a client-side JavaScript library that enables zero-knowledge identity verification directly in the browser. Users can prove identity attributes (age, nationality, document validity) without revealing sensitive personal information. All processing happens locally—no data leaves the user's device.

### Key Features

- **Zero-Knowledge Proofs**: Verify identity claims without exposing raw data
- **Browser-Native**: Works entirely client-side—no backend required
- **Document Scanning**: Automatic MRZ extraction from passport/ID cards
- **Face Verification**: Liveness detection and biometric matching
- **Midnight Compatible**: Proofs verifiable on Midnight blockchain
- **Multi-Language**: English and French UI support
- **Flexible Checks**: Customizable proof clauses for your use case

---

## Installation

### npm

```bash
npm install verime-zk
```

### yarn

```bash
yarn add verime-zk
```

### pnpm

```bash
pnpm add verime-zk
```

### Bundle Configuration

**Important**: VeriMe ZK includes WebAssembly dependencies. Configure your bundler accordingly:

#### Webpack

Configure Webpack with `asyncWebAssembly: true` in experiments.

#### Rollup

Use `@rollup/plugin-wasm` plugin for WASM support.

#### Vite

Vite handles WASM automatically—no configuration needed.

**Bundle Size**: ~500KB minified (gzipped: ~180KB)

---

## Quick Start

Import `generateProof` and `verifyProof` from `verime-zk`. Call `generateProof` with your checks array to create a proof, then use `verifyProof` to validate the proof hash.

---

## API Reference

### `generateProof(options: GenerateOptions) => Promise<ProofResult>`

Generates a zero-knowledge proof based on user input and selected checks. This function:

1. Requests camera access
2. Captures document image
3. Extracts MRZ data
4. Performs face verification
5. Generates ZK proof locally

#### Parameters

**`options`** (object, required)

- **`checks`** (array, required): Array of proof clauses. Each clause can be:
  - **String**: `'adult'` — Prove age >= 18 (from DOB in MRZ)
  - **Object**: 
    - `{ country: string }` — e.g., `{ country: 'CD' }` for Congo
    - `{ validity: string }` — e.g., `{ validity: '365d' }` for expiry >1 year
    - `{ nameMatch: string }` — e.g., `{ nameMatch: 'John Doe' }` to match extracted name
    - `{ custom: (claims: Claims) => boolean }` — Custom logic function

- **`onProgress`** (function, optional): Progress callback
  ```typescript
  (step: string, status: 'pending' | 'success' | 'error') => void
  ```
  Steps: `'setup'`, `'capture'`, `'extract'`, `'verify'`, `'prove'`

- **`language`** (string, optional): UI language. Default: `'en'`. Options: `'en'` | `'fr'`

- **`debug`** (boolean, optional): Enable debug logging. Default: `false`

#### Returns

**`Promise<ProofResult>`**

```typescript
{
  hash: string;           // Compact ZK proof hash (e.g., "0xabc123...")
  clauses: string[];      // Verified claims (e.g., ["adult:true", "country:CD:true"])
  timestamp: Date;        // Generation timestamp
  success: boolean;       // True if all checks passed
}
```

#### Throws

- `CameraAccessDenied` — User blocked camera access
- `InvalidDocument` — MRZ parsing failed (blurry scan, invalid format)
- `SpoofDetected` — Liveness check failed (photo on screen detected)
- `LowMatchScore` — Face match score below threshold
- `ZKGenerationFailed` — Proof generation error (retry recommended)

---

### `verifyProof(hash: string, checks: CheckArray) => Promise<boolean>`

Verifies a provided proof against specified checks. This is a pure validation function—no user input required.

#### Parameters

- **`hash`** (string, required): The ZK proof hash from `generateProof`
- **`checks`** (array, required): Same format as `generateProof.checks`. Only verifies matching clauses

#### Returns

**`Promise<boolean>`** — `true` if proof is valid and matches all checks

---

## TypeScript Types

```typescript
type Check = 
  | 'adult'
  | { country: string }
  | { validity: string }  // e.g., '365d', '730d'
  | { nameMatch: string }
  | { custom: (claims: Claims) => boolean };

type Claims = {
  name: string;
  dob: Date;
  expiry: Date;
  countryCode: string;
  faceMatchScore: number;  // 0-1
};

type ProofResult = {
  hash: string;
  clauses: string[];
  timestamp: Date;
  success: boolean;
};

type GenerateOptions = {
  checks: Check[];
  onProgress?: (step: string, status: 'pending' | 'success' | 'error') => void;
  language?: 'en' | 'fr';
  debug?: boolean;
};
```

---

## UI Integration

### DOM Events

For custom UI implementations, `generateProof` emits DOM events:

- **`verimezk:progress`** — Progress updates with `detail.step` and `detail.status` ('pending' | 'success' | 'error')

- **`verimezk:result`** — Final result with `detail.result` containing the `ProofResult` object

Listen to these events to update your UI during the verification process.

---

## Error Handling

### Common Errors

| Error | Description | Solution |
|-------|-------------|----------|
| `CameraAccessDenied` | User blocked camera access | Prompt user to enable camera permissions |
| `InvalidDocument` | MRZ parsing failed | Request re-scan with better lighting |
| `SpoofDetected` | Liveness check failed | Ensure real person (not photo) |
| `LowMatchScore` | Face match below threshold | Retry with better lighting/angle |
| `ZKGenerationFailed` | Proof generation error | Retry operation |

Handle errors by catching exceptions and checking the error name to provide appropriate user feedback.

---

## Advanced Usage

### Custom Proof Circuits

For Midnight developers: Extend ZK functionality with custom Halo2 circuits.

1. **Define Custom Circuit**

   Create `src/zk/custom-circuit.js` with a `buildCircuit` function that accepts claims and returns a Halo2 circuit. Access claims properties like `claims.name`, `claims.dob`, `claims.expiry`, etc.

2. **Use Custom Circuit**

   Pass `customCircuit: true` in the options when calling `generateProof`.

See [Halo2 Documentation](https://github.com/privacy-scaling-explorations/halo2) for circuit authoring.

### Custom Check Functions

Use the `custom` check type with a function that receives `Claims` and returns a boolean. This allows you to implement app-specific verification logic.

---

## Testing

### Run Tests

```bash
npm test
```

Test suite uses Jest with 80% coverage. Capture operations are mocked using sample MRZ data from ICAO standards.

### Mock Examples

Mock data available in `tests/mocks/` for development and testing without camera access.

---

## Limitations

- **HTTPS Required**: Camera access requires HTTPS in production environments
- **Mobile Optimization**: Optimized for mobile-first; iOS Safari may have quirks
- **Single User**: No multi-face support (single user verification only)
- **Browser Support**: Modern browsers with WebAssembly and WebRTC support

### Browser Compatibility

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | iOS 14+ required |
| Edge | 90+ | Full support |

---

## Use Cases

- **DeFi KYC**: Age verification for DeFi protocols
- **NFT Minting**: Gated access based on identity attributes
- **DAO Governance**: Proof of citizenship/nationality for voting
- **Compliance**: Document validity checks for regulated services
- **Privacy-Preserving Authentication**: Zero-knowledge login systems

---

## Contributing

Contributions welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## Support

- **Documentation**: [Full API Docs](./docs/API.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/verime-zk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/verime-zk/discussions)
- **Security**: [Security Policy](SECURITY.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

---

## Acknowledgments

- Built with [Halo2](https://github.com/privacy-scaling-explorations/halo2) zero-knowledge proof system
- Compatible with [Midnight](https://midnight.network) blockchain
- MRZ parsing based on ICAO standards

---

<div align="center">

**Made for privacy-first applications**

[Documentation](./docs/) • [Examples](./examples/) • [Changelog](./CHANGELOG.md)

</div>

