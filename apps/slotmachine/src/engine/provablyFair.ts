import CryptoJS from 'crypto-js';

export interface ProvablyFairResult {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  combinedHash: string;
  floats: number[];
}

export function generateServerSeed(): string {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
}

export function hashServerSeed(serverSeed: string): string {
  return CryptoJS.SHA256(serverSeed).toString(CryptoJS.enc.Hex);
}

export function calculateProvablyFair(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  count: number = 20
): ProvablyFairResult {
  const message = `${clientSeed}:${nonce}`;
  const combinedHash = CryptoJS.HmacSHA256(message, serverSeed).toString(CryptoJS.enc.Hex);
  
  const floats: number[] = [];
  for (let i = 0; i < count; i++) {
    const chunk = combinedHash.substring((i % 8) * 8, ((i % 8) + 1) * 8);
    const intVal = parseInt(chunk, 16);
    floats.push(intVal / 0xffffffff);
  }

  return {
    serverSeed,
    serverSeedHash: hashServerSeed(serverSeed),
    clientSeed,
    nonce,
    combinedHash,
    floats
  };
}
