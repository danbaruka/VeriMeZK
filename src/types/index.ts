// TypeScript types for VeriMeZK

export type VerificationStep = 
  | 'idle' 
  | 'connected' 
  | 'scanning' 
  | 'verifying' 
  | 'proving' 
  | 'signing' 
  | 'complete';

export type Check = 
  | 'adult'
  | { country: string }
  | { validity: string }
  | { nameMatch: string }
  | { custom: (claims: Claims) => boolean };

export interface Claims {
  name: string;
  dob: Date;
  expiry: Date;
  countryCode: string;
  faceMatchScore: number;
}

export interface ProofResult {
  hash: string;
  clauses: string[];
  timestamp: Date;
  success: boolean;
}

export interface MRZData {
  documentType: string;
  countryCode: string;
  name: string;
  passportNumber: string;
  nationality: string;
  dob: string;
  gender: string;
  expiryDate: string;
  personalNumber?: string;
}

export interface VerificationState {
  step: VerificationStep;
  walletAddress?: string;
  walletName?: string;
  mrzData?: MRZData;
  faceMatchScore?: number;
  proofResult?: ProofResult;
  error?: string;
}

export interface MidnightProviders {
  zkConfigProvider: any;
  proofProvider: any;
  dataProvider: any;
  stateProvider: any;
  networkId: any;
}

