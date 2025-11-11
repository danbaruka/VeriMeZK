# 5 Core Technical Features to Implement

## 1. MRZ OCR Text Extraction from Document Images
**Feature:** Implement Optical Character Recognition (OCR) for extracting Machine Readable Zone (MRZ) text directly from passport and ID card images.

**Current State:** 
- Uses QR code scanning (`jsqr`) which assumes MRZ is encoded as QR
- Only works with QR-encoded MRZ data
- Cannot process standard printed MRZ text on documents

**Technical Requirements:**
- Integrate OCR library (Tesseract.js recommended for browser compatibility)
- Implement image preprocessing pipeline:
  - Grayscale conversion
  - Contrast enhancement
  - Noise reduction
  - Orientation correction
- MRZ region detection and extraction
- Support for TD1 (ID card) and TD3 (passport) formats
- MRZ checksum validation
- Error handling for low-quality images

**Implementation Approach:**
1. Install `tesseract.js` or `@tesseract.js/core`
2. Create `src/lib/ocr/mrz-extractor.ts` utility module
3. Implement image preprocessing functions
4. Configure OCR with MRZ-specific settings (character whitelist, PSM mode)
5. Parse extracted text using existing MRZ parser
6. Validate checksums and format compliance
7. Update `DocumentScanner.tsx` to use OCR instead of QR scanning

**Acceptance Criteria:**
- Successfully extracts MRZ from passport images (>90% accuracy with good lighting)
- Supports both TD1 and TD3 formats
- Validates MRZ checksums
- Provides clear error messages for failed extractions
- Works on mobile devices with camera capture
- Bundle size impact <3MB

**Dependencies:**
- `tesseract.js` or `@tesseract.js/core`
- Image processing utilities

---

## 2. Face Recognition Model Integration and Optimization
**Feature:** Download, integrate, and optimize face-api.js models for production face verification.

**Current State:**
- Component expects models in `/public/models` but they don't exist
- Models loaded on every component mount (inefficient)
- No caching or preloading strategy
- No error recovery if models fail to load

**Technical Requirements:**
- Download required face-api.js model files:
  - `tiny_face_detector_model-weights_manifest.json` + shard files
  - `face_landmark_68_model-weights_manifest.json` + shard files
  - `face_recognition_model-weights_manifest.json` + shard files
- Implement singleton model loader with caching
- Preload models on app initialization
- Cache models in IndexedDB for faster subsequent loads
- Add loading progress indicators
- Implement model validation and error handling

**Implementation Approach:**
1. Download models from face-api.js releases to `public/models/`
2. Create `src/lib/biometric/models.ts` with singleton loader class
3. Implement model caching in IndexedDB
4. Preload models in `App.tsx` or `main.tsx`
5. Add global loading state for model loading
6. Update `FaceVerification.tsx` to use centralized loader
7. Add model integrity checks and fallback handling

**Acceptance Criteria:**
- All required models included in repository
- Models load successfully on first visit (<5 seconds)
- Models cached for subsequent visits (<1 second load)
- Loading progress shown to users
- Clear error messages if models fail to load
- Works on mobile devices
- Bundle size impact documented

**Dependencies:**
- `face-api.js` (already installed)
- Model files (~2-3MB total)

---

## 3. Real Zero-Knowledge Proof Generation with Midnight Dust
**Feature:** Implement actual zero-knowledge proof generation using Midnight Dust library instead of simulated proofs.

**Current State:**
- Proof generation is simulated with `setTimeout` and random hashes
- No actual cryptographic proof generation
- Proofs cannot be verified on-chain
- No integration with Midnight Dust circuit compilation

**Technical Requirements:**
- Design ZK circuits for identity verification:
  - Age verification circuit (prove age >= 18 without revealing DOB)
  - Country verification circuit (prove country without revealing full nationality)
  - Document validity circuit (prove expiry > threshold without revealing date)
  - Face match circuit (prove match score > threshold without revealing descriptor)
- Integrate Midnight Dust library
- Convert MRZ data and face match score to circuit inputs
- Generate witness from inputs
- Compile circuits
- Generate proofs using Midnight Dust
- Return proof hash and public inputs

**Implementation Approach:**
1. Research Midnight Dust integration and circuit format
2. Install `@midnight-ntwrk/midnight-dust` (or equivalent package)
3. Create circuit definitions in `src/lib/zk/circuits/`
4. Implement proof generation in `src/lib/zk/proof.ts`
5. Update `ProofGenerator.tsx` to use real proof generation
6. Add progress tracking for proof generation steps
7. Implement proof verification function

**Acceptance Criteria:**
- Real ZK proofs generated using Midnight Dust
- Proofs verify correctly on Midnight network
- Private data (DOB, exact age, expiry date) not revealed
- Public claims (age >= 18, country, validity) verifiable
- Proof generation completes in <30 seconds
- Error handling for failed proof generation
- Proofs stored in Midnight contract
- Documentation for circuit design

**Dependencies:**
- `@midnight-ntwrk/midnight-dust` (or equivalent)
- Midnight SDK providers (already integrated)
- Circuit compilation tools

---

## 4. Real Transaction Building and Signing with MeshJS
**Feature:** Implement actual Cardano transaction building, signing, and submission using MeshJS instead of simulation.

**Current State:**
- Transaction signing is simulated with timeout
- No actual transaction building
- No real wallet signing
- Transactions not submitted to blockchain

**Technical Requirements:**
- Build Cardano transactions using MeshJS `Transaction` class
- Encode proof metadata in transaction metadata (CIP-20 format)
- Handle UTXO selection and transaction fees
- Sign transactions using connected wallet
- Submit transactions to Cardano/Midnight network
- Poll for transaction confirmation
- Handle transaction errors (insufficient funds, network errors, user rejection)

**Implementation Approach:**
1. Create `src/lib/transactions/builder.ts` utility module
2. Implement transaction building function:
   - Create transaction with MeshJS `Transaction` class
   - Add recipients (contract address with minimum ADA)
   - Encode proof hash and clauses in metadata (key 674)
3. Update `TransactionSigner.tsx`:
   - Replace simulation with real transaction building
   - Use `wallet.signTx()` for signing
   - Use `wallet.submitTx()` for submission
   - Poll for confirmation
4. Add transaction status tracking (building, signing, submitting, confirmed)
5. Implement error handling for all failure cases
6. Add transaction explorer links

**Acceptance Criteria:**
- Real transactions built using MeshJS
- Transactions signed by connected wallet
- Transactions submitted to network
- Transaction hashes displayed correctly
- Transaction confirmation tracked
- Error handling for all failure cases
- Metadata correctly encoded (CBOR format)
- Works with Lace wallet (and other wallets)
- Transaction explorer links work
- Loading states shown during process

**Dependencies:**
- `@meshsdk/core` (already installed)
- `@meshsdk/react` (already installed)

---

## 5. Face Matching Against Document Photo
**Feature:** Implement actual face comparison between live camera capture and passport photo descriptor extracted from document.

**Current State:**
- Generates random face match score (95-99%)
- No actual comparison with document photo
- No extraction of face descriptor from passport
- Anyone can pass face verification

**Technical Requirements:**
- Extract face descriptor from passport photo region:
  - Detect passport photo region in scanned document
  - Extract face from photo region
  - Generate face descriptor using face-api.js
- Capture live face from camera
- Generate face descriptor for live face
- Compare descriptors using cosine similarity or Euclidean distance
- Calculate match score (0-1 scale)
- Set threshold (e.g., 0.95) for verification
- Handle edge cases (multiple faces, no face detected, poor quality)

**Implementation Approach:**
1. Create `src/lib/biometric/face-matcher.ts` utility module
2. Implement passport photo extraction:
   - Detect photo region in document image
   - Extract and preprocess photo
   - Generate descriptor using face-api.js
3. Update `DocumentScanner.tsx`:
   - Extract and store passport photo descriptor
   - Store descriptor in verification context
4. Update `FaceVerification.tsx`:
   - Capture live face and generate descriptor
   - Compare with stored passport descriptor
   - Calculate match score
   - Verify against threshold
5. Add liveness detection (optional enhancement)
6. Improve error messages for low match scores

**Acceptance Criteria:**
- Passport photo extracted from document scan
- Face descriptor generated from passport photo
- Live face descriptor generated from camera
- Accurate comparison between descriptors
- Match score calculated correctly
- Verification threshold enforced (>= 0.95)
- Clear error messages for low scores
- Works with various passport formats
- Handles edge cases gracefully

**Dependencies:**
- `face-api.js` (already installed)
- Image processing utilities

