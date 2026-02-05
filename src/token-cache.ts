import * as fs from 'fs';
import * as path from 'path';
import { CONFIG_DIR } from './config';

export interface Token {
  symbol: string;
  name: string;
  blockchain: string;
  decimals: number;
  assetId: string;
}

export interface TokenCache {
  tokens: Token[];
  lastUpdated: string;
  expiresAt: number;
}

const TOKENS_FILE = path.join(CONFIG_DIR, 'tokens.json');
const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Ensure config directory exists
 */
function ensureCacheDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Load tokens from local cache file
 */
export function loadTokensFromCache(): TokenCache | null {
  try {
    if (!fs.existsSync(TOKENS_FILE)) {
      return null;
    }

    const data = fs.readFileSync(TOKENS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading token cache:', error);
    return null;
  }
}

/**
 * Save tokens to local cache file
 */
export function saveTokensToCache(tokens: Token[], expiresAt?: number): void {
  try {
    ensureCacheDir();
    
    const cache: TokenCache = {
      tokens,
      lastUpdated: new Date().toISOString(),
      expiresAt: expiresAt || Math.floor(Date.now() / 1000) + CACHE_TTL,
    };

    fs.writeFileSync(TOKENS_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving token cache:', error);
  }
}

/**
 * Check if cache is expired
 */
export function isCacheExpired(cache: TokenCache): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now > cache.expiresAt;
}

/**
 * Find token by symbol and blockchain
 */
export function findToken(symbol: string, blockchain: string = 'near'): Token | null {
  const cache = loadTokensFromCache();
  
  if (!cache || cache.tokens.length === 0) {
    return null;
  }

  // Normalize inputs
  const normalizedSymbol = symbol.toLowerCase();
  const normalizedBlockchain = blockchain.toLowerCase();

  // Find exact match first
  let token = cache.tokens.find(
    t => t.symbol.toLowerCase() === normalizedSymbol && 
         t.blockchain.toLowerCase() === normalizedBlockchain
  );

  // If no exact match, try partial match
  if (!token) {
    token = cache.tokens.find(
      t => t.symbol.toLowerCase().includes(normalizedSymbol) && 
           t.blockchain.toLowerCase() === normalizedBlockchain
    );
  }

  return token || null;
}

/**
 * Get or fetch tokens (with caching)
 */
export async function getTokens(fetchFn: () => Promise<{ tokens: Token[]; expiresAt?: number }>): Promise<Token[]> {
  const cache = loadTokensFromCache();
  
  // Return cached tokens if valid
  if (cache && !isCacheExpired(cache)) {
    return cache.tokens;
  }
  
  // Fetch fresh tokens
  const response = await fetchFn();
  saveTokensToCache(response.tokens, response.expiresAt);
  
  return response.tokens;
}
