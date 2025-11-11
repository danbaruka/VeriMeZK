// Utility functions for VeriMeZK

export function formatAddress(address: string, startLength = 8, endLength = 8): string {
  if (!address || address.length < startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export function formatADA(lovelace: string | number | bigint): string {
  const amount = typeof lovelace === 'bigint' ? Number(lovelace) : Number(lovelace);
  return (amount / 1000000).toFixed(2);
}

export function isValidAddress(address: string): boolean {
  return address.startsWith('addr') || address.startsWith('0x');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

