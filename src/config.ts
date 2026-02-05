import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export const API_BASE_URL = 'https://api.openclawchain.org/api/v1';
export const CONFIG_DIR = path.join(os.homedir(), '.occ');
export const ENV_FILE = path.join(CONFIG_DIR, '.env');
export const ENV_TEMP_FILE = path.join(CONFIG_DIR, '.env.temp');
export const WALLETS_FILE = path.join(CONFIG_DIR, 'wallets.json');

export interface Config {
  apiKey?: string;
  solanaPublicKey?: string;
  solanaPrivateKey?: string;
  nearPublicKey?: string;
  nearPrivateKey?: string;
  nearAccountAddress?: string;
  nearRecipientAddress?: string;
  nearRefundAddress?: string;
  nearNetwork?: string;
  nearRpcUrl?: string;
  // Mainnet-specific NEAR credentials (for swaps)
  nearMainnetAccountAddress?: string;
  nearMainnetPrivateKey?: string;
  // Solana swap configuration (for future cross-chain support)
  solanaAccountAddress?: string;
  solanaRecipientAddress?: string;
  solanaRefundAddress?: string;
  solanaNetwork?: string;
  solanaRpcUrl?: string;
  // Ethereum swap configuration (for future cross-chain support)
  ethereumAccountAddress?: string;
  ethereumPrivateKey?: string;
  ethereumRecipientAddress?: string;
  ethereumRefundAddress?: string;
  ethereumNetwork?: string;
  ethereumRpcUrl?: string;
  // Generic blockchain configuration (for future chains)
  [key: string]: string | undefined;
}

export interface WalletInfo {
  chain: 'solana' | 'near';
  network: 'devnet' | 'testnet' | 'mainnet-beta' | 'mainnet';
  publicKey: string;
  createdAt: string;
  accountId?: string; // For NEAR named accounts
}

export interface WalletsRegistry {
  wallets: WalletInfo[];
}

export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadWalletsRegistry(): WalletsRegistry {
  ensureConfigDir();
  
  if (!fs.existsSync(WALLETS_FILE)) {
    return { wallets: [] };
  }

  try {
    const content = fs.readFileSync(WALLETS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to load wallets registry:', error);
    return { wallets: [] };
  }
}

export function saveWalletsRegistry(registry: WalletsRegistry): void {
  ensureConfigDir();
  fs.writeFileSync(WALLETS_FILE, JSON.stringify(registry, null, 2), 'utf-8');
}

export function addWalletToRegistry(walletInfo: WalletInfo): void {
  const registry = loadWalletsRegistry();
  
  // Check if wallet already exists (same chain, network, and publicKey)
  const existingIndex = registry.wallets.findIndex(
    w => w.chain === walletInfo.chain && 
         w.network === walletInfo.network && 
         w.publicKey === walletInfo.publicKey
  );
  
  if (existingIndex >= 0) {
    // Update existing wallet
    registry.wallets[existingIndex] = walletInfo;
  } else {
    // Add new wallet
    registry.wallets.push(walletInfo);
  }
  
  saveWalletsRegistry(registry);
}

export function getWalletsByChain(chain: 'solana' | 'near'): WalletInfo[] {
  const registry = loadWalletsRegistry();
  return registry.wallets.filter(w => w.chain === chain);
}

export function getWalletByChainAndNetwork(chain: 'solana' | 'near', network: string): WalletInfo | undefined {
  const registry = loadWalletsRegistry();
  return registry.wallets.find(w => w.chain === chain && w.network === network);
}

export function loadConfig(): Config {
  ensureConfigDir();
  
  const config: Config = {};
  
  // Load from ~/.occ/.env (consolidated config location)
  if (fs.existsSync(ENV_FILE)) {
    const content = fs.readFileSync(ENV_FILE, 'utf-8');
    parseEnvContent(content, config);
  }

  return config;
}

function parseEnvContent(content: string, config: Config): void {
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();

    if (key === 'OCC_API_KEY') config.apiKey = value;
    if (key === 'SOLANA_PUBLIC_KEY') config.solanaPublicKey = value;
    if (key === 'SOLANA_PRIVATE_KEY') config.solanaPrivateKey = value;
    
    // Support multiple formats for NEAR account/public key
    if (key === 'NEAR_PUBLIC_KEY') config.nearPublicKey = value;
    if (key === 'NEAR_ACCOUNT_ADDRESS') {
      config.nearAccountAddress = value;
      // If no nearPublicKey set, use account address as fallback
      if (!config.nearPublicKey) config.nearPublicKey = value;
    }
    if (key === 'NEAR_PRIVATE_KEY') config.nearPrivateKey = value;
    
    // Network-specific NEAR credentials
    if (key === 'NEAR_MAINNET_ACCOUNT_ADDRESS') config.nearMainnetAccountAddress = value;
    if (key === 'NEAR_MAINNET_PRIVATE_KEY') config.nearMainnetPrivateKey = value;
    
    // Swap configuration
    if (key === 'NEAR_RECIPIENT_ADDRESS') config.nearRecipientAddress = value;
    if (key === 'NEAR_REFUND_ADDRESS') config.nearRefundAddress = value;
    
    // NEAR network configuration
    if (key === 'NEAR_NETWORK') config.nearNetwork = value;
    if (key === 'NEAR_RPC_URL') config.nearRpcUrl = value;
    
    // Solana swap configuration
    if (key === 'SOLANA_ACCOUNT_ADDRESS') config.solanaAccountAddress = value;
    if (key === 'SOLANA_RECIPIENT_ADDRESS') config.solanaRecipientAddress = value;
    if (key === 'SOLANA_REFUND_ADDRESS') config.solanaRefundAddress = value;
    if (key === 'SOLANA_NETWORK') config.solanaNetwork = value;
    if (key === 'SOLANA_RPC_URL') config.solanaRpcUrl = value;
    
    // Ethereum swap configuration
    if (key === 'ETHEREUM_ACCOUNT_ADDRESS') config.ethereumAccountAddress = value;
    if (key === 'ETHEREUM_PRIVATE_KEY') config.ethereumPrivateKey = value;
    if (key === 'ETHEREUM_RECIPIENT_ADDRESS') config.ethereumRecipientAddress = value;
    if (key === 'ETHEREUM_REFUND_ADDRESS') config.ethereumRefundAddress = value;
    if (key === 'ETHEREUM_NETWORK') config.ethereumNetwork = value;
    if (key === 'ETHEREUM_RPC_URL') config.ethereumRpcUrl = value;
    
    // Store all keys for generic blockchain support
    config[key.toLowerCase()] = value;
  });
}

export function saveConfig(config: Config): void {
  ensureConfigDir();

  const lines: string[] = [
    '# OpenClawChain Configuration',
    '# Generated by occ-cli',
    '',
  ];

  if (config.apiKey) {
    lines.push(`OCC_API_KEY=${config.apiKey}`);
  }
  if (config.solanaPublicKey) {
    lines.push(`SOLANA_PUBLIC_KEY=${config.solanaPublicKey}`);
  }
  if (config.solanaPrivateKey) {
    lines.push(`SOLANA_PRIVATE_KEY=${config.solanaPrivateKey}`);
  }
  if (config.nearPublicKey) {
    lines.push(`NEAR_PUBLIC_KEY=${config.nearPublicKey}`);
  }
  if (config.nearPrivateKey) {
    lines.push(`NEAR_PRIVATE_KEY=${config.nearPrivateKey}`);
  }

  fs.writeFileSync(ENV_FILE, lines.join('\n'), 'utf-8');
}

export function updateConfig(updates: Partial<Config>): void {
  const current = loadConfig();
  saveConfig({ ...current, ...updates });
}

export function savePrivateKeyToTempFile(privateKey: string, chain: string = 'SOLANA'): string {
  ensureConfigDir();
  
  const keyName = `${chain.toUpperCase()}_PRIVATE_KEY`;
  
  const content = [
    `# ${chain.toUpperCase()} PRIVATE KEY`,
    '# ⚠️  KEEP THIS SECURE - DO NOT SHARE',
    '# Copy this key to your .env file and then DELETE this file',
    '',
    `${keyName}=${privateKey}`,
    '',
    '# Instructions:',
    '# 1. Copy the line above',
    '# 2. Add it to your .env file (or ~/.clawd/.env for agents)',
    '# 3. Delete this file immediately',
  ].join('\n');
  
  fs.writeFileSync(ENV_TEMP_FILE, content, { mode: 0o600 }); // Read/write for owner only
  
  return ENV_TEMP_FILE;
}

// Blockchain validation and environment checking

export type SupportedBlockchain = 'near' | 'solana' | 'ethereum' | 'bitcoin' | 'polygon' | 'arbitrum' | 'base' | 'optimism';

export const SUPPORTED_BLOCKCHAINS: SupportedBlockchain[] = ['near'];

export interface BlockchainEnvVars {
  accountAddress?: string;
  privateKey?: string;
  recipientAddress?: string;
  refundAddress?: string;
  network?: string;
  rpcUrl?: string;
}

export interface BlockchainValidationResult {
  valid: boolean;
  blockchain: string;
  missingVars: string[];
  message?: string;
}

/**
 * Check if a blockchain is supported for swaps
 */
export function isSupportedBlockchain(blockchain: string): boolean {
  return SUPPORTED_BLOCKCHAINS.includes(blockchain.toLowerCase() as SupportedBlockchain);
}

/**
 * Get required environment variable names for a blockchain
 */
export function getRequiredEnvVars(blockchain: string): string[] {
  const prefix = blockchain.toUpperCase();
  return [
    `${prefix}_ACCOUNT_ADDRESS`,
    `${prefix}_PRIVATE_KEY`,
    `${prefix}_RECIPIENT_ADDRESS`,
    `${prefix}_REFUND_ADDRESS`,
    `${prefix}_NETWORK`,
    `${prefix}_RPC_URL`,
  ];
}

/**
 * Get blockchain environment variables from config
 */
export function getBlockchainEnvVars(blockchain: string, config: Config): BlockchainEnvVars {
  const prefix = blockchain.toLowerCase();
  
  if (prefix === 'near') {
    return {
      accountAddress: config.nearMainnetAccountAddress || config.nearAccountAddress,
      privateKey: config.nearMainnetPrivateKey || config.nearPrivateKey,
      recipientAddress: config.nearRecipientAddress,
      refundAddress: config.nearRefundAddress,
      network: config.nearNetwork,
      rpcUrl: config.nearRpcUrl,
    };
  }
  
  // Add support for other blockchains here in the future
  return {};
}

/**
 * Validate blockchain environment variables
 */
export function validateBlockchainEnv(blockchain: string, config: Config): BlockchainValidationResult {
  const envVars = getBlockchainEnvVars(blockchain, config);
  const requiredVars = getRequiredEnvVars(blockchain);
  const missingVars: string[] = [];
  
  // Check each required variable
  if (!envVars.accountAddress) missingVars.push(`${blockchain.toUpperCase()}_ACCOUNT_ADDRESS`);
  if (!envVars.privateKey) missingVars.push(`${blockchain.toUpperCase()}_PRIVATE_KEY`);
  if (!envVars.recipientAddress) missingVars.push(`${blockchain.toUpperCase()}_RECIPIENT_ADDRESS`);
  if (!envVars.refundAddress) missingVars.push(`${blockchain.toUpperCase()}_REFUND_ADDRESS`);
  if (!envVars.network) missingVars.push(`${blockchain.toUpperCase()}_NETWORK`);
  if (!envVars.rpcUrl) missingVars.push(`${blockchain.toUpperCase()}_RPC_URL`);
  
  const valid = missingVars.length === 0;
  
  return {
    valid,
    blockchain,
    missingVars,
    message: valid 
      ? `${blockchain.toUpperCase()} environment configured correctly`
      : `Missing ${blockchain.toUpperCase()} configuration`,
  };
}

/**
 * Validate multiple blockchains for cross-chain swaps
 */
export function validateCrossChainEnv(fromChain: string, toChain: string, config: Config): {
  valid: boolean;
  fromChainResult: BlockchainValidationResult;
  toChainResult: BlockchainValidationResult;
} {
  const fromChainResult = validateBlockchainEnv(fromChain, config);
  const toChainResult = validateBlockchainEnv(toChain, config);
  
  return {
    valid: fromChainResult.valid && toChainResult.valid,
    fromChainResult,
    toChainResult,
  };
}
