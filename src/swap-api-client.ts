import { API_BASE_URL } from './config';

export interface Token {
  symbol: string;
  name: string;
  blockchain: string;
  decimals: number;
  assetId: string;
}

export interface TokensResponse {
  tokens: Token[];
  cached: boolean;
  expiresAt?: number;
}

export interface QuoteRequest {
  fromToken: string;
  toToken: string;
  amount: string;
  recipientAddress: string;
  refundAddress: string;
  dry?: boolean;
}

export interface QuoteResponse {
  depositAddress: string;
  memo?: string;
  expectedOutput: string;
  exchangeRate: string;
  fees: string;
  expiresAt: number;
}

export interface StatusResponse {
  status: string;
  transactionHash?: string;
  timestamp?: string;
  message?: string;
}

export interface SubmitRequest {
  depositAddress: string;
  transactionHash: string;
  memo?: string;
}

export interface SubmitResponse {
  success: boolean;
  message: string;
}

export interface ExecuteRequest {
  depositAddress: string;
  amount: string;
  fromToken: string;
  memo?: string;
}

export interface ExecuteResponse {
  transactions: Array<{
    receiverId: string;
    actions: Array<{
      type: string;
      params: {
        methodName: string;
        args: Record<string, any>;
        gas: string;
        deposit: string;
      };
    }>;
  }>;
  tokenContract: string;
  blockchain: string;
  instructions: string;
}

export class SwapApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        error: { message: response.statusText } 
      }));
      const errorMessage = (error as any).error?.message || `API request failed: ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  async getTokens(): Promise<TokensResponse> {
    return this.fetch<TokensResponse>('/swap/tokens');
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    return this.fetch<QuoteResponse>('/swap/quote', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getStatus(depositAddress: string, memo?: string): Promise<StatusResponse> {
    const params = new URLSearchParams({ depositAddress });
    if (memo) {
      params.append('memo', memo);
    }
    return this.fetch<StatusResponse>(`/swap/status?${params.toString()}`);
  }

  async submitDeposit(request: SubmitRequest): Promise<SubmitResponse> {
    return this.fetch<SubmitResponse>('/swap/submit', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async executeSwap(request: ExecuteRequest): Promise<ExecuteResponse> {
    return this.fetch<ExecuteResponse>('/swap/execute', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}
