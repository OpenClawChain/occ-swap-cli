# OCC Swap CLI

Lightweight CLI for USDC and token swaps on NEAR Mainnet. Perfect for AI agents, DeFi automation, and hackathon projects.

[![npm version](https://img.shields.io/npm/v/@openclawchain/swap-cli.svg)](https://www.npmjs.com/package/@openclawchain/swap-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔄 Swap 28+ tokens on NEAR Mainnet including USDC, wNEAR, ETH, wBTC
- 💵 USDC-focused for stable value operations
- 🔐 Secure local signing (keys never leave your machine)
- ⚡ Fast quotes and execution
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

### 1. Setup Environment

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

### 2. List Available Tokens

```bash
occ-swap swap tokens --blockchain near
```

### 3. Get a Quote

```bash
occ-swap swap quote --from wrap.near --to usdc --amount 1.5
```

### 4. Execute Swap

```bash
occ-swap swap execute --deposit-address <address-from-quote> --amount 1.5 --from wrap.near
```

### 5. Check Status

```bash
occ-swap swap status --deposit-address <address-from-quote>
```

## Documentation

- **[Agent Guide (occ.md)](./occ.md)** - Complete guide for AI agents
- **[USDC Guide (occ-usdc.md)](./occ-usdc.md)** - USDC-focused guide for hackathons
- **[Comparison](./COMPARISON.md)** - Differences from full OCC CLI

## Supported Tokens

28 tokens on NEAR Mainnet including:
- **Stablecoins:** USDC, USDT, FRAX
- **Major:** wNEAR, ETH, wBTC, BTC
- **DeFi:** AURORA, SWEAT, HAPI, mpDAO
- **AI:** RHEA, PUBLIC
- **Meme:** BLACKDRAGON, SHITZU, and more

See full list: `occ-swap swap tokens --blockchain near`

## Requirements

- Node.js >= 18.0.0
- NEAR Mainnet account with private key
- Tokens in your NEAR wallet

## Commands

### List Tokens

```bash
occ-swap swap tokens [--blockchain near] [--symbol <symbol>] [--refresh]
```

### Get Quote

```bash
occ-swap swap quote --from <token> --to <token> --amount <amount>
```

**Important:** You MUST get a quote before executing a swap. The deposit address from the quote is required.

### Execute Swap

```bash
occ-swap swap execute --deposit-address <address> --amount <amount> --from <token>
```

**Note:** Quotes expire in ~10 minutes. Execute before expiration or get a new quote.

### Check Status

```bash
occ-swap swap status --deposit-address <address>
```

## Security

- Private keys stored locally in `~/.occ/.env`
- All signing happens on your machine
- Keys never sent to any server
- Open source and auditable

## Use Cases

- **AI Agents:** Autonomous token swaps and treasury management
- **DeFi Automation:** Automated trading strategies
- **USDC Operations:** Stable value storage and payments
- **Arbitrage:** Cross-DEX price difference exploitation
- **Portfolio Management:** Automated rebalancing

## How It Works

### Transaction Flow

1. **Get Quote** - API prepares swap parameters and generates deposit address
2. **Sign Locally** - CLI signs transactions with your private key
3. **Execute** - Transactions are broadcast to NEAR blockchain
4. **Track** - Monitor swap status via API

### NEAR Token Swaps

For NEAR NEP-141 tokens, two transactions are executed:

1. **Storage Deposit** - Registers the deposit address in the token contract
2. **Token Transfer** - Transfers tokens to the deposit address

The swap service monitors the deposit address and executes the swap automatically.

## Troubleshooting

### "Blockchain not supported"

Currently only NEAR Mainnet is supported. Ensure you're using NEAR tokens.

### "Missing configuration"

Check that all required environment variables are set in `~/.occ/.env`:
```bash
cat ~/.occ/.env
```

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

## Development

```bash
# Clone repository
git clone https://github.com/openclawchain/occ-swap-cli.git
cd occ-swap-cli

# Install dependencies
npm install

# Build
npm run build

# Link for local testing
npm link
```

## Publishing

```bash
# Build and publish
npm run build
npm publish --access public
```

## Related Projects

- **occ-cli** - Full-featured OCC CLI with wallet management
- **occ-foundation-api** - Backend API for OCC services
- **occ-skill** - CLAWD skill for AI agents

## Support

- **Issues:** https://github.com/openclawchain/occ-swap-cli/issues
- **API:** https://api.openclawchain.org
- **Network:** NEAR Mainnet only

## License

MIT - see [LICENSE](./LICENSE) file

## Contributing

Contributions welcome! Please open an issue or PR.

---

Built with ❤️ by OpenClawChain
