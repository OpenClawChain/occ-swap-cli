# OCC Swap CLI - Agent Guide

**Version:** 1.0.0  
**Description:** Lightweight CLI for token swaps on NEAR blockchain  
**npm:** https://www.npmjs.com/package/@openclawchain/swap-cli  
**GitHub:** https://github.com/OpenClawChain/occ-swap-cli  
**Base API:** `https://api.openclawchain.org/api/v1`

## What This Tool Does

`occ-swap` lets you swap tokens on the NEAR blockchain. It's a focused tool that does one thing well: token swaps.

**You can:**
- List available tokens for swapping
- Get real-time swap quotes with exchange rates
- Execute swaps securely (your keys never leave your machine)
- Track swap status

**Currently supported:** NEAR Mainnet only (28 tokens including wNEAR, USDC, USDT, ETH, wBTC)

⚠️ **Network Requirement:** Only NEAR Mainnet is supported. Testnet swaps are not available.

---

## ⚠️ IMPORTANT: Required Workflow

**You MUST follow this order:**

1. **First:** Run `quote` to get the deposit address
2. **Then:** Run `execute` using that deposit address (before quote expires!)
3. **Finally:** Run `status` to check completion

**Never skip the quote step!** The deposit address from the quote is required for execute to work.

**Quotes expire!** Each quote is valid for ~10 minutes. If you wait too long, get a new quote.

```bash
# ✅ CORRECT: Quote first, then execute quickly
occ-swap swap quote --from wrap.near --to usdc --amount 1.5
# (copy deposit address from output)
# (check "Expires At" timestamp)
occ-swap swap execute --deposit-address <address> --amount 1.5 --from wrap.near

# ❌ WRONG: Cannot execute without a deposit address from quote
occ-swap swap execute --amount 1.5 --from wrap.near  # This will fail!

# ⏰ EXPIRED: If quote expired, get a new one
# If you see "Quote expired" error, run quote again to get fresh deposit address
```

---

## Installation

Install the CLI globally using npm:

```bash
npm install -g @openclawchain/swap-cli
```

Verify installation:

```bash
occ-swap --version
```

---

## Setup (Do This Once)

### Step 1: Get Your NEAR Credentials

You need a NEAR Mainnet account to swap tokens. If you don't have one:

1. Go to https://wallet.near.org/ (mainnet only)
2. Create an account (e.g., `myagent.near`)
3. Export your private key:
   - Settings → Security & Recovery → Export Private Key
   - Copy the key (starts with `ed25519:`)

⚠️ **Important:** Only NEAR Mainnet accounts are supported. Do not use testnet accounts.

### Step 2: Configure Environment

Create `~/.occ/.env` with your credentials:

```bash
# Required for swaps
NEAR_ACCOUNT_ADDRESS=myagent.near
NEAR_PRIVATE_KEY=ed25519:your_private_key_here
NEAR_RECIPIENT_ADDRESS=myagent.near
NEAR_REFUND_ADDRESS=myagent.near
NEAR_NETWORK=mainnet
NEAR_RPC_URL=https://rpc.mainnet.near.org
```

**Important Configuration Notes:**

- **`NEAR_ACCOUNT_ADDRESS`** - Your NEAR Mainnet account (e.g., `myagent.near`)
- **`NEAR_PRIVATE_KEY`** - The private key for your NEAR Mainnet account (starts with `ed25519:`)
- **`NEAR_RECIPIENT_ADDRESS`** - Where you receive swapped tokens (use the same account: `myagent.near`)
- **`NEAR_REFUND_ADDRESS`** - Where refunds go if swap fails (use the same account: `myagent.near`)
- **`NEAR_NETWORK`** - Must be set to `mainnet` (testnet not supported)

**All three address variables should be set to YOUR NEAR Mainnet account.** They're the same value (e.g., `myagent.near`).

**Save this file to:** `~/.occ/.env`

**Security:** Your private key is stored securely in the `.env` file and never sent to any server. All transaction signing happens locally on your machine.

### Step 3: Verify Setup

Test that everything works:

```bash
occ-swap swap tokens --blockchain near
```

If you see a list of tokens, you're ready to swap!

---

## How to Use

⚠️ **CRITICAL: You MUST call `quote` before `execute`!**

The swap workflow requires TWO steps:
1. **`quote`** - Get the deposit address and exchange rate
2. **`execute`** - Use the deposit address to sign and send transactions

**You cannot execute a swap without first getting a quote!** The deposit address from the quote is required for the execute command.

### 1. List Available Tokens

See what tokens you can swap:

```bash
# List all NEAR tokens
occ-swap swap tokens --blockchain near

# Search for specific token
occ-swap swap tokens --symbol usdc

# Force refresh cache
occ-swap swap tokens --refresh
```

### 2. Get a Swap Quote

Before swapping, get a quote to see the exchange rate and fees:

```bash
occ-swap swap quote \
  --from wrap.near \
  --to usdc \
  --amount 1.5
```

**Important:** Save the `deposit-address` from the quote - you'll need it to execute the swap!

⚠️ **REQUIRED WORKFLOW:**
```bash
# Step 1: ALWAYS get quote first (this generates the deposit address)
occ-swap swap quote --from wrap.near --to usdc --amount 1.5

# Step 2: Copy the deposit address from the quote output

# Step 3: Use that deposit address in execute command
occ-swap swap execute --deposit-address <address-from-quote> --amount 1.5 --from wrap.near
```

**Why this order matters:**
- The `quote` command contacts the swap API and generates a unique deposit address for your swap
- The `execute` command needs this deposit address to create and sign the blockchain transactions
- Without the deposit address from a quote, execute will fail

⏰ **QUOTE EXPIRATION:**
- Each quote has an expiration timestamp (typically ~10 minutes)
- You MUST execute the swap before the quote expires
- If the quote expires, you must get a new quote with a fresh deposit address
- Check the "Expires At" field in the quote output

```bash
# Quote output shows expiration
Expires At: 2026-02-05T12:30:00Z

# If you wait too long and the quote expires:
# ❌ Execute will fail with "Quote expired" error
# ✅ Solution: Get a new quote and use the new deposit address
```

### 3. Execute the Swap

Use the deposit address from your quote:

```bash
occ-swap swap execute \
  --deposit-address abc123.near \
  --amount 1.5 \
  --from wrap.near
```

### 4. Check Swap Status

Monitor your swap progress:

```bash
occ-swap swap status --deposit-address abc123.near
```

---

## Supported Tokens on NEAR

**28 NEAR tokens available for swapping:**

### Major Tokens (7)
| Symbol | Name | Contract | Decimals |
|--------|------|----------|----------|
| wNEAR | Wrapped NEAR | `wrap.near` | 24 |
| ETH | Bridged Ethereum | `eth.bridge.near` | 18 |
| USDC | USD Coin | `17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1` | 6 |
| USDT | Tether USD | `usdt.tether-token.near` | 6 |
| FRAX | Frax Stablecoin | `853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near` | 18 |
| wBTC | Wrapped Bitcoin | `2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near` | 8 |
| BTC | Native Bitcoin | `nbtc.bridge.near` | 8 |

### DeFi & Ecosystem Tokens (8)
| Symbol | Name | Contract | Decimals |
|--------|------|----------|----------|
| AURORA | Aurora | `aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near` | 18 |
| SWEAT | Sweat Economy | `token.sweat` | 18 |
| HAPI | HAPI Protocol | `d9c2d319cd7e6177336b0a9c93c21cb48d84fb54.factory.bridge.near` | 18 |
| mpDAO | Meta Pool DAO | `mpdao-token.near` | 6 |
| ITLX | Intellex | `itlx.intellex_xyz.near` | 24 |
| CFI | Consumer Finance | `cfi.consumer-fi.near` | 18 |
| NPRO | NEAR Mobile | `npro.nearmobile.near` | 24 |
| STJACK | St. Jack | `stjack.tkn.primitives.near` | 18 |

### AI & Innovation Tokens (2)
| Symbol | Name | Contract | Decimals |
|--------|------|----------|----------|
| RHEA | Rhea Lab | `token.rhealab.near` | 18 |
| PUBLIC | Public AI Lab | `token.publicailab.near` | 18 |

### Meme & Community Tokens (7)
| Symbol | Name | Contract | Decimals |
|--------|------|----------|----------|
| BLACKDRAGON | Black Dragon | `blackdragon.tkn.near` | 24 |
| SHITZU | Shitzu | `token.0xshitzu.near` | 18 |
| ABG | ABG | `abg-966.meme-cooking.near` | 18 |
| NOEAR | No NEAR | `noear-324.meme-cooking.near` | 18 |
| JAMBO | Jambo | `jambo-1679.meme-cooking.near` | 18 |
| GNEAR | GNEAR | `gnear-229.meme-cooking.near` | 18 |
| PURGE | Purge | `purge-558.meme-cooking.near` | 18 |

### Other Tokens (4)
| Symbol | Name | Contract | Decimals |
|--------|------|----------|----------|
| NearKat | Near Kat | `kat.token0.near` | 18 |
| TURBO | Turbo | `a35923162c49cf95e6bf26623385eb431ad920d3.factory.bridge.near` | 18 |
| ZEC | Zcash | `1cs_v1:near:nep141:zec.omft.near` | 8 |
| TESTNEBULA | Test Nebula | `test-token.highdome3013.near` | 8 |

**To see the latest list:**
```bash
occ-swap swap tokens --blockchain near
```

---

## Quick Reference

### Essential Commands

```bash
# List tokens
occ-swap swap tokens --blockchain near

# Get quote
occ-swap swap quote --from wrap.near --to usdc --amount 1.5

# Execute swap
occ-swap swap execute --deposit-address <address> --amount 1.5 --from wrap.near

# Check status
occ-swap swap status --deposit-address <address>
```

### Configuration File

**Location:** `~/.occ/.env`

**Required variables:**
```bash
NEAR_ACCOUNT_ADDRESS=your-account.near
NEAR_PRIVATE_KEY=ed25519:...
NEAR_RECIPIENT_ADDRESS=your-account.near
NEAR_REFUND_ADDRESS=your-account.near
NEAR_NETWORK=mainnet
NEAR_RPC_URL=https://rpc.mainnet.near.org
```

**Note:** `NEAR_ACCOUNT_ADDRESS`, `NEAR_RECIPIENT_ADDRESS`, and `NEAR_REFUND_ADDRESS` should all be set to your NEAR Mainnet account (same value). The `NEAR_PRIVATE_KEY` is the private key for that account, stored securely in `.env`. `NEAR_NETWORK` must be `mainnet`.

---

## What Your Human Can Ask

Your human can prompt you to:
- "Swap 1.5 wNEAR to USDC"
- "Check available tokens on NEAR"
- "Get a quote for swapping ETH to wNEAR"
- "What's the exchange rate for USDC to USDT?"
- "Check the status of my swap"
- "List all tokens I can swap"

You don't need to wait - if they ask, do it!

---

## Remember

✅ **Always get a quote first** - Know the rate before swapping  
✅ **Check status after swapping** - Confirm completion  
✅ **Keep keys secure** - Never expose your private key  
✅ **Handle errors gracefully** - Swaps can fail, have a backup plan  
✅ **Cache token list** - Don't fetch it every time  

🦞 Happy swapping!
