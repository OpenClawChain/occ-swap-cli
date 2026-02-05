# OCC Swap Guide

Quick reference for using the OCC swap functionality.

## Prerequisites

1. **NEAR Wallet** (for executing swaps): Generate with `occ wallet generate --chain near --network mainnet`
2. **Configuration**: Ensure `~/.occ/.env` contains:
   ```env
   NEAR_PUBLIC_KEY=your-account.near
   NEAR_PRIVATE_KEY=ed25519:your_private_key_here
   ```

**Note:** API key is NOT required for swap operations. Swap endpoints are public.

## Quick Start

### 1. List Available Tokens

```bash
# All tokens
occ swap tokens

# NEAR tokens only
occ swap tokens --blockchain near

# Search for USDC
occ swap tokens --symbol usdc
```

### 2. Get a Quote

```bash
occ swap quote \
  --from wrap.near \
  --to usdc \
  --amount 1.5
```

**Note the deposit address from the output!**

### 3. Execute the Swap

```bash
occ swap execute \
  --deposit-address <from_quote> \
  --amount 1.5 \
  --from wrap.near
```

### 4. Check Status

```bash
occ swap status --deposit-address <from_quote>
```

## Command Reference

### `occ swap tokens`

List all supported tokens.

**Options:**
- `--blockchain <chain>` - Filter by blockchain (near, ethereum, solana, etc.)
- `--symbol <symbol>` - Filter by token symbol

**Examples:**
```bash
occ swap tokens
occ swap tokens --blockchain near
occ swap tokens --symbol usdc
```

### `occ swap quote`

Get a swap quote with deposit address.

**Required Options:**
- `--from <token>` - From token symbol (e.g., wrap.near, usdc)
- `--to <token>` - To token symbol (e.g., usdc, usdt)
- `--amount <amount>` - Amount in token units (e.g., 1.5)

**Optional Options:**
- `--recipient <address>` - Recipient address (defaults to your NEAR account)
- `--refund <address>` - Refund address (defaults to your NEAR account)
- `--dry` - Dry run mode (test with mock addresses)

**Examples:**
```bash
# Basic quote
occ swap quote --from wrap.near --to usdc --amount 1.5

# With custom recipient
occ swap quote \
  --from wrap.near \
  --to usdc \
  --amount 1.5 \
  --recipient alice.near

# Dry run (test mode)
occ swap quote \
  --from wrap.near \
  --to usdc \
  --amount 1.5 \
  --dry
```

### `occ swap execute`

Execute a swap by signing and sending transactions (NEAR tokens only).

**Required Options:**
- `--deposit-address <address>` - Deposit address from quote
- `--amount <amount>` - Amount in token units
- `--from <token>` - From token symbol

**Optional Options:**
- `--memo <memo>` - Optional memo

**Examples:**
```bash
occ swap execute \
  --deposit-address abc123def456... \
  --amount 1.5 \
  --from wrap.near
```

**What it does:**
1. Gets unsigned transactions from API
2. Signs transactions locally with your NEAR private key
3. Sends transactions to NEAR blockchain
4. Submits transaction hash to API

**Security:** Your private key never leaves your machine.

### `occ swap status`

Check the status of a swap.

**Required Options:**
- `--deposit-address <address>` - Deposit address from quote

**Optional Options:**
- `--memo <memo>` - Memo (for certain chains)

**Examples:**
```bash
occ swap status --deposit-address abc123def456...
```

**Status Values:**
- `PENDING_DEPOSIT` - Waiting for deposit
- `PROCESSING` - Swap in progress
- `SUCCESS` - Swap completed
- `FAILED` - Swap failed

## Supported Blockchains

### NEAR (Full CLI Support)

For NEAR tokens (NEP-141), use the CLI to execute swaps:

```bash
occ swap execute \
  --deposit-address <from_quote> \
  --amount 1.5 \
  --from wrap.near
```

The CLI will sign transactions locally and send them to the blockchain.

### Other Blockchains (Use Native Wallet)

For non-NEAR tokens, use your native wallet to send tokens to the deposit address:

**Ethereum/EVM Chains:**
- Use MetaMask, Rainbow, or Coinbase Wallet
- Send tokens directly to deposit address

**Solana:**
- Use Phantom, Solflare, or Backpack
- Send SPL tokens to deposit address

**Bitcoin:**
- Use any Bitcoin wallet
- Send BTC to deposit address

**Cosmos Chains:**
- Use Keplr or Cosmostation
- **Important:** Include the memo from the quote!

## Common Workflows

### Swap NEAR Tokens

```bash
# 1. List NEAR tokens
occ swap tokens --blockchain near

# 2. Get quote
occ swap quote --from wrap.near --to usdc --amount 1.5

# 3. Execute (note the deposit address from step 2)
occ swap execute \
  --deposit-address <from_step_2> \
  --amount 1.5 \
  --from wrap.near

# 4. Check status
occ swap status --deposit-address <from_step_2>
```

### Test with Dry Run

```bash
# Get a test quote without executing
occ swap quote \
  --from wrap.near \
  --to usdc \
  --amount 1.5 \
  --dry
```

This returns a quote with mock addresses for testing.

### Monitor Swap Progress

```bash
# Check status every 30 seconds
watch -n 30 occ swap status --deposit-address abc123def456...
```

## Troubleshooting

### "NEAR credentials not configured"

**Solution:** Generate a NEAR wallet:
```bash
occ wallet generate --chain near --network mainnet
```

### "Execute command only supports NEAR tokens"

**Solution:** For non-NEAR tokens, use your native wallet to send tokens to the deposit address from the quote.

### "Token not found"

**Solution:** 
- Run `occ swap tokens` to see available tokens
- Check token symbol spelling
- Try searching: `occ swap tokens --symbol <partial_name>`

### Swap stuck in "PENDING_DEPOSIT"

**Solution:**
- Wait 30-60 seconds for blockchain confirmation
- Check transaction on blockchain explorer
- Verify you sent to the correct deposit address
- Ensure you sent the correct amount

### Transaction failed

**Solution:**
- Check you have enough NEAR for gas fees
- Verify token balance is sufficient
- Check network status (mainnet vs testnet)

## Security Best Practices

✅ **DO:**
- Store private keys in `~/.occ/.env`
- Verify amounts before executing swaps
- Check exchange rates in quotes
- Monitor swap status until completion
- Keep deposit addresses from quotes

❌ **DON'T:**
- Share your private keys
- Execute swaps without verifying quotes
- Use production keys for testing
- Ignore failed transactions

## API Integration

If you're building an agent or application, you can use the API directly:

```typescript
import { SwapApiClient } from '@openclawchain/cli/swap-api-client';

const client = new SwapApiClient(process.env.OCC_API_KEY);

// Get tokens
const tokens = await client.getTokens();

// Get quote
const quote = await client.getQuote({
  fromToken: 'nep141:wrap.near',
  toToken: 'nep141:usdc.near',
  amount: '1500000000000000000000000',
  recipientAddress: 'your-account.near',
  refundAddress: 'your-account.near',
});

// Execute swap
const executeResponse = await client.executeSwap({
  depositAddress: quote.depositAddress,
  amount: '1500000000000000000000000',
  fromToken: 'nep141:wrap.near',
});

// Sign and send transactions locally
// (see repos/occ-cli/src/near-signer.ts)

// Check status
const status = await client.getStatus(quote.depositAddress);
```

## Support

- Documentation: https://docs.openclawchain.org
- GitHub: https://github.com/openclawchain
- Discord: https://discord.gg/openclawchain

---

Built for agents, by agents ⛓️
