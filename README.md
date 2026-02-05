# OCC Swap CLI

[![npm version](https://img.shields.io/npm/v/@openclawchain/swap-cli.svg)](https://www.npmjs.com/package/@openclawchain/swap-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/GitHub-OpenClawChain-blue)](https://github.com/OpenClawChain/occ-swap-cli)

Lightweight CLI for USDC and token swaps on NEAR Mainnet. Perfect for AI agents, DeFi automation, and hackathon projects.

**Links:**
- 📦 **npm:** https://www.npmjs.com/package/@openclawchain/swap-cli
- 💻 **GitHub:** https://github.com/OpenClawChain/occ-swap-cli
- 📚 **API:** https://api.openclawchain.org

## Why USDC for AI Agents?

- 💵 **Stable value** - No volatility, predictable pricing
- 🌐 **Universal** - Accepted across DeFi protocols
- 🤖 **Agent-friendly** - Perfect for autonomous trading
- ⚡ **Fast settlement** - Quick swaps on NEAR blockchain

## Features

- 🔄 Swap 28+ tokens on NEAR Mainnet including USDC, wNEAR, ETH, wBTC
- 💵 USDC-focused for stable value operations
- 🔐 Secure local signing (keys never leave your machine)
- ⚡ Fast quotes and execution (~10 minute quote validity)
- 🤖 AI agent-friendly CLI interface

## Installation

```bash
npm install -g @openclawchain/swap-cli
```

Verify installation:
```bash
occ-swap --version
```

## Quick Start

### 1. Get NEAR Mainnet Account

Create a NEAR Mainnet account at https://wallet.near.org/ and export your private key.

⚠️ **Important:** Only NEAR Mainnet is supported. Testnet swaps are not available.

### 2. Configure Environment

Create `~/.occ/.env`:

```bash
NEAR_ACCOUNT_ADDRESS=your-account.near
NEAR_PRIVATE_KEY=ed25519:your_private_key_here
NEAR_RECIPIENT_ADDRESS=your-account.near
NEAR_REFUND_ADDRESS=your-account.near
NEAR_NETWORK=mainnet
NEAR_RPC_URL=https://rpc.mainnet.near.org
```

**Note:** All three address variables should be set to your NEAR Mainnet account (same value).

### 3. List Available Tokens

```bash
occ-swap swap tokens --blockchain near
```

### 4. Get a Quote

```bash
occ-swap swap quote --from wrap.near --to usdc --amount 1.5
```

### 5. Execute Swap

```bash
occ-swap swap execute --deposit-address <address-from-quote> --amount 1.5 --from wrap.near
```

### 6. Check Status

```bash
occ-swap swap status --deposit-address <address-from-quote>
```

## ⚠️ IMPORTANT: Required Workflow

**You MUST follow this order:**

1. **First:** Run `quote` to get the deposit address
2. **Then:** Run `execute` using that deposit address (before quote expires!)
3. **Finally:** Run `status` to check completion

**Never skip the quote step!** The deposit address from the quote is required for execute to work.

**Quotes expire in ~10 minutes.** If expired, get a new quote.

```bash
# ✅ CORRECT
occ-swap swap quote --from wrap.near --to usdc --amount 1.5
occ-swap swap execute --deposit-address <address> --amount 1.5 --from wrap.near

# ❌ WRONG: Cannot execute without deposit address from quote
occ-swap swap execute --amount 1.5 --from wrap.near
```

## USDC on NEAR

**Contract:** `17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1`  
**Network:** NEAR Mainnet only  
**Decimals:** 6  
**Symbol:** `usdc`

USDC on NEAR is a NEP-141 token with:
- ✅ Fast transfers (2-3 second finality)
- ✅ Low cost (~$0.01 per transaction)
- ✅ Full NEAR DeFi compatibility
- ✅ Bridged from Ethereum via Rainbow Bridge

## Supported Tokens

28 tokens on NEAR Mainnet:

### Major Tokens (7)
- **wNEAR** - Wrapped NEAR
- **ETH** - Bridged Ethereum
- **USDC** - USD Coin ⭐
- **USDT** - Tether USD
- **FRAX** - Frax Stablecoin
- **wBTC** - Wrapped Bitcoin
- **BTC** - Native Bitcoin

### DeFi & Ecosystem (8)
AURORA, SWEAT, HAPI, mpDAO, ITLX, CFI, NPRO, STJACK

### AI & Innovation (2)
RHEA, PUBLIC

### Meme & Community (7)
BLACKDRAGON, SHITZU, ABG, NOEAR, JAMBO, GNEAR, PURGE

### Other (4)
NearKat, TURBO, ZEC, TESTNEBULA

See full list: `occ-swap swap tokens --blockchain near`

## Commands

### List Tokens

```bash
occ-swap swap tokens [--blockchain near] [--symbol <symbol>] [--refresh]
```

### Get Quote

```bash
occ-swap swap quote --from <token> --to <token> --amount <amount>
```

**Examples:**
```bash
# Swap wNEAR to USDC
occ-swap swap quote --from wrap.near --to usdc --amount 1.5

# Swap USDC to wNEAR
occ-swap swap quote --from usdc --to wrap.near --amount 10

# Swap ETH to USDC
occ-swap swap quote --from eth --to usdc --amount 0.5
```

### Execute Swap

```bash
occ-swap swap execute --deposit-address <address> --amount <amount> --from <token>
```

**What happens:**
1. CLI prepares two transactions (storage deposit + token transfer)
2. Signs them locally with your private key
3. Broadcasts to NEAR blockchain
4. Swap service detects deposit and executes swap
5. You receive tokens at your recipient address

### Check Status

```bash
occ-swap swap status --deposit-address <address>
```

**Status values:**
- `PENDING` - Waiting for deposit
- `PROCESSING` - Swap in progress
- `SUCCESS` - Swap completed!
- `FAILED` - Swap failed (tokens refunded)

## USDC Use Cases

### 1. Stable Value Storage
Convert volatile tokens to USDC:
```bash
occ-swap swap quote --from wrap.near --to usdc --amount 10
```

### 2. DeFi Integration
Use USDC as base currency:
```bash
occ-swap swap quote --from eth --to usdc --amount 0.5
```

### 3. Cross-Protocol Payments
USDC is accepted everywhere:
```bash
occ-swap swap quote --from aurora --to usdc --amount 100
```

### 4. Arbitrage Trading
Trade with USDC as base:
```bash
occ-swap swap quote --from usdc --to wrap.near --amount 50
```

### 5. Treasury Management
Maintain stable reserves:
```bash
occ-swap swap quote --from sweat --to usdc --amount 1000
```

## USDC Trading Pairs

**Popular pairs:**

### Stablecoins
- USDC ↔ USDT - Stablecoin arbitrage
- USDC ↔ FRAX - Algorithmic stablecoin

### Major Tokens
- USDC ↔ wNEAR - NEAR ecosystem base pair
- USDC ↔ ETH - Ethereum exposure
- USDC ↔ wBTC - Bitcoin exposure

### DeFi Tokens
- USDC ↔ AURORA - Aurora ecosystem
- USDC ↔ SWEAT - Move-to-earn token
- USDC ↔ HAPI - Security protocol

## Security

- Private keys stored locally in `~/.occ/.env`
- All signing happens on your machine
- Keys never sent to any server
- Open source and auditable

## Requirements

- Node.js >= 18.0.0
- NEAR Mainnet account with private key
- Tokens in your NEAR wallet

## Documentation

- **[Agent Guide (occ.md)](./occ.md)** - Complete guide for AI agents
- **[USDC Guide (occ-usdc.md)](./occ-usdc.md)** - USDC-focused guide for hackathons
- **[Comparison](./COMPARISON.md)** - Differences from full OCC CLI
- **[Publishing Guide](./PUBLISHING.md)** - How to publish updates

## Troubleshooting

### "Blockchain not supported"
Only NEAR Mainnet is supported. Ensure you're using NEAR tokens.

### "Missing configuration"
Check that all required environment variables are set in `~/.occ/.env`.

### "Token not found"
Refresh the token cache:
```bash
occ-swap swap tokens --refresh
```

### "Quote expired"
Get a new quote - quotes expire in ~10 minutes:
```bash
occ-swap swap quote --from wrap.near --to usdc --amount 1.5
```

## USDC Hackathon Ideas

1. **USDC Savings Agent** - Auto-convert earnings to USDC
2. **USDC Payment Bot** - Accept any token, convert to USDC
3. **USDC Arbitrage Trader** - Trade with USDC as base
4. **USDC Treasury Manager** - Maintain reserves in USDC
5. **USDC DeFi Aggregator** - Route USDC through best yields
6. **USDC Tipping Bot** - Send USDC tips across platforms
7. **USDC Subscription Service** - Collect recurring USDC payments
8. **USDC Payroll System** - Distribute salaries in USDC

## Development

```bash
# Clone repository
git clone https://github.com/OpenClawChain/occ-swap-cli.git
cd occ-swap-cli

# Install dependencies
npm install

# Build
npm run build

# Link for local testing
npm link
```

## Related Projects

- **occ-cli** - Full-featured OCC CLI with wallet management
- **occ-foundation-api** - Backend API for OCC services
- **occ-skill** - CLAWD skill for AI agents

## Support

- **npm:** https://www.npmjs.com/package/@openclawchain/swap-cli
- **GitHub:** https://github.com/OpenClawChain/occ-swap-cli
- **Issues:** https://github.com/OpenClawChain/occ-swap-cli/issues
- **API:** https://api.openclawchain.org

## License

MIT - see [LICENSE](./LICENSE) file

## Contributing

Contributions welcome! Please open an issue or PR.

---

Built with ❤️ by OpenClawChain for the USDC Ecosystem Hackathon
