# OCC Swap CLI - USDC Agent Guide

**Version:** 1.0.0  
**Description:** Lightweight CLI for USDC swaps on NEAR blockchain  
**Base API:** `https://api.openclawchain.org/api/v1`  
**Hackathon:** USDC Ecosystem for AI Agents

## What This Tool Does

`occ-swap` lets you swap tokens on the NEAR blockchain with a **focus on USDC** - the leading stablecoin for AI agent economies.

**You can:**
- Swap any NEAR token to/from USDC
- Get real-time USDC exchange rates
- Execute USDC swaps securely (your keys never leave your machine)
- Track USDC swap status

**Why USDC for AI Agents?**
- 💵 **Stable value** - No volatility, predictable pricing
- 🌐 **Universal** - Accepted across DeFi protocols
- 🤖 **Agent-friendly** - Perfect for autonomous trading
- ⚡ **Fast settlement** - Quick swaps on NEAR blockchain

**Currently supported:** NEAR Mainnet with 28 tokens including USDC, wNEAR, USDT, ETH, wBTC

⚠️ **Network Requirement:** Only NEAR Mainnet is supported. Testnet swaps are not available.

---

## ⚠️ IMPORTANT: Required Workflow

**You MUST follow this order:**

1. **First:** Run `quote` to get the deposit address and USDC rate
2. **Then:** Run `execute` using that deposit address (before quote expires!)
3. **Finally:** Run `status` to check USDC received

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

## USDC on NEAR

**Contract Address:** `17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1`  
**Network:** NEAR Mainnet only  
**Decimals:** 6  
**Symbol:** `usdc` (case-insensitive)

USDC on NEAR is a NEP-141 token (NEAR's fungible token standard), making it:
- ✅ Fast to transfer (2-3 second finality)
- ✅ Low cost (~$0.01 per transaction)
- ✅ Fully compatible with NEAR DeFi ecosystem
- ✅ Bridged from Ethereum via Rainbow Bridge

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
1. **`quote`** - Get the deposit address and USDC exchange rate
2. **`execute`** - Use the deposit address to sign and send transactions

**You cannot execute a swap without first getting a quote!** The deposit address from the quote is required for the execute command.

### 1. List Available Tokens

See what tokens you can swap with USDC:

```bash
# List all NEAR tokens
occ-swap swap tokens --blockchain near

# Search for USDC specifically
occ-swap swap tokens --symbol usdc

# Force refresh cache
occ-swap swap tokens --refresh
```

**USDC is available!** You'll see:
```
USDC      USD Coin                  near           6 decimals
```

### 2. Get a USDC Swap Quote

Before swapping, get a quote to see the exchange rate:

**Example: Swap wNEAR to USDC**
```bash
occ-swap swap quote \
  --from wrap.near \
  --to usdc \
  --amount 1.5
```

**Example: Swap USDC to wNEAR**
```bash
occ-swap swap quote \
  --from usdc \
  --to wrap.near \
  --amount 10
```

**Example: Swap ETH to USDC**
```bash
occ-swap swap quote \
  --from eth \
  --to usdc \
  --amount 0.5
```

**Parameters:**
- `--from` - Token you're swapping from (e.g., `wrap.near`, `eth`, `usdc`)
- `--to` - Token you're swapping to (use `usdc` for USDC)
- `--amount` - How much to swap (in token units, not smallest unit)
- `--from-chain` - Source blockchain (default: `near`)
- `--to-chain` - Destination blockchain (default: `near`)

**Example output:**
```
Swap Quote
────────────────────────────────────────────────────────────────────────────────
Deposit Address: abc123.near
Expected Output: 2.45 USDC
Exchange Rate:   1 wNEAR = 1.63 USDC
Fees:            0.3%
Expires At:      2026-02-05T12:30:00Z
────────────────────────────────────────────────────────────────────────────────

To execute this swap, run:
occ-swap swap execute --deposit-address abc123.near --amount 1.5 --from wrap.near
```

**Important:** Save the `deposit-address` - you'll need it to execute the swap!

⚠️ **REQUIRED WORKFLOW:**
```bash
# Step 1: ALWAYS get quote first (this generates the deposit address)
occ-swap swap quote --from wrap.near --to usdc --amount 1.5

# Step 2: Copy the deposit address from the quote output

# Step 3: Use that deposit address in execute command
occ-swap swap execute --deposit-address <address-from-quote> --amount 1.5 --from wrap.near
```

**Why this order matters:**
- The `quote` command contacts the swap API and generates a unique deposit address for your USDC swap
- The `execute` command needs this deposit address to create and sign the blockchain transactions
- Without the deposit address from a quote, execute will fail
- Each quote generates a fresh deposit address that's monitored by the swap service

⏰ **QUOTE EXPIRATION:**
- Each quote has an expiration timestamp (typically ~10 minutes)
- You MUST execute the USDC swap before the quote expires
- If the quote expires, you must get a new quote with a fresh deposit address
- Check the "Expires At" field in the quote output

```bash
# Quote output shows expiration
Expires At: 2026-02-05T12:30:00Z

# If you wait too long and the quote expires:
# ❌ Execute will fail with "Quote expired" error
# ✅ Solution: Get a new quote and use the new deposit address
```

### 3. Execute the USDC Swap

Use the deposit address from your quote:

**Swap TO USDC:**
```bash
occ-swap swap execute \
  --deposit-address abc123.near \
  --amount 1.5 \
  --from wrap.near
```

**Swap FROM USDC:**
```bash
occ-swap swap execute \
  --deposit-address xyz789.near \
  --amount 10 \
  --from usdc
```

**What happens:**
1. CLI prepares two transactions (storage deposit + token transfer)
2. Signs them locally with your private key
3. Broadcasts to NEAR blockchain
4. Swap service detects deposit and executes swap
5. You receive USDC (or other token) at your recipient address

**Example output:**
```
Step 1: Getting unsigned transactions...
Token Contract: wrap.near
Transactions: 2

Step 2: Signing and sending transactions...
✓ Transactions sent successfully!

Storage Registration TX: 8xY9z...
Token Transfer TX: 3aB4c...

Step 3: Submitting to API...
✓ Swap submitted successfully!

Check status with:
occ-swap swap status --deposit-address abc123.near
```

### 4. Check USDC Swap Status

Monitor your swap progress:

```bash
occ-swap swap status --deposit-address abc123.near
```

**Example output:**
```
Swap Status
────────────────────────────────────────────────────────────────────────────────
Status:           SUCCESS
Transaction Hash: 3aB4c...
Timestamp:        2026-02-05T12:25:30Z
Message:          Swap completed successfully
────────────────────────────────────────────────────────────────────────────────
```

**Status values:**
- `PENDING` - Waiting for deposit
- `PROCESSING` - Swap in progress
- `SUCCESS` - Swap completed, USDC received!
- `FAILED` - Swap failed (tokens refunded)

---

## USDC Use Cases for AI Agents

### 1. Stable Value Storage
Convert volatile tokens to USDC for stable value:
```bash
# Convert wNEAR to USDC when price is high
occ-swap swap quote --from wrap.near --to usdc --amount 10
```

### 2. DeFi Integration
Use USDC as base currency for DeFi operations:
```bash
# Get USDC to provide liquidity
occ-swap swap quote --from eth --to usdc --amount 0.5
```

### 3. Cross-Protocol Payments
USDC is accepted everywhere:
```bash
# Convert any token to USDC for payments
occ-swap swap quote --from aurora --to usdc --amount 100
```

### 4. Arbitrage Trading
Take advantage of price differences:
```bash
# Buy low, sell high with USDC as base
occ-swap swap quote --from usdc --to wrap.near --amount 50
```

### 5. Treasury Management
Maintain stable reserves:
```bash
# Convert profits to USDC
occ-swap swap quote --from sweat --to usdc --amount 1000
```

---

## Common USDC Workflows

### Convert Earnings to USDC

```bash
# 1. Check current rate
occ-swap swap quote --from wrap.near --to usdc --amount 5

# 2. Execute if rate is good
occ-swap swap execute --deposit-address <address> --amount 5 --from wrap.near

# 3. Verify USDC received
occ-swap swap status --deposit-address <address>
```

### Buy Assets with USDC

```bash
# 1. Get quote for USDC → Asset
occ-swap swap quote --from usdc --to eth --amount 100

# 2. Execute purchase
occ-swap swap execute --deposit-address <address> --amount 100 --from usdc

# 3. Confirm asset received
occ-swap swap status --deposit-address <address>
```

### Rebalance Portfolio to USDC

```bash
# Convert multiple tokens to USDC
occ-swap swap quote --from wrap.near --to usdc --amount 2
occ-swap swap quote --from eth --to usdc --amount 0.1
occ-swap swap quote --from aurora --to usdc --amount 50

# Execute each swap
# ... (use deposit addresses from quotes)
```

---

## USDC Trading Pairs

**Popular pairs with USDC:**

### Stablecoins
- **USDC ↔ USDT** - Stablecoin arbitrage
- **USDC ↔ FRAX** - Algorithmic stablecoin

### Major Tokens
- **USDC ↔ wNEAR** - NEAR ecosystem base pair
- **USDC ↔ ETH** - Ethereum exposure
- **USDC ↔ wBTC** - Bitcoin exposure

### DeFi Tokens
- **USDC ↔ AURORA** - Aurora ecosystem
- **USDC ↔ SWEAT** - Move-to-earn token
- **USDC ↔ HAPI** - Security protocol

**Get current rates:**
```bash
# Check any pair with USDC
occ-swap swap quote --from <token> --to usdc --amount <amount>
occ-swap swap quote --from usdc --to <token> --amount <amount>
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

### Essential USDC Commands

```bash
# List tokens (find USDC)
occ-swap swap tokens --symbol usdc

# Get quote TO USDC
occ-swap swap quote --from wrap.near --to usdc --amount 1.5

# Get quote FROM USDC
occ-swap swap quote --from usdc --to wrap.near --amount 10

# Execute swap TO USDC
occ-swap swap execute --deposit-address <address> --amount 1.5 --from wrap.near

# Execute swap FROM USDC
occ-swap swap execute --deposit-address <address> --amount 10 --from usdc

# Check status
occ-swap swap status --deposit-address <address>
```

### USDC Token Details

**Symbol:** `usdc` (case-insensitive)  
**Contract:** `17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1`  
**Decimals:** 6  
**Standard:** NEP-141 (NEAR Fungible Token)  
**Network:** NEAR Protocol

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
- **"Swap 1.5 wNEAR to USDC"** - Convert NEAR to stable value
- **"Get USDC price for 10 wNEAR"** - Check current exchange rate
- **"Buy 0.5 ETH with USDC"** - Use USDC to purchase assets
- **"Convert all my SWEAT to USDC"** - Stabilize earnings
- **"What's the USDC/USDT rate?"** - Compare stablecoins
- **"Check my USDC swap status"** - Monitor transaction
- **"List all tokens I can swap to USDC"** - See available pairs

You don't need to wait - if they ask, do it!

---

## USDC Best Practices for Agents

### 1. Use USDC as Base Currency
Keep reserves in USDC for stable value:
```bash
# Convert volatile tokens to USDC regularly
occ-swap swap quote --from wrap.near --to usdc --amount <amount>
```

### 2. Monitor USDC Rates
Check rates before large swaps:
```bash
# Get multiple quotes
occ-swap swap quote --from wrap.near --to usdc --amount 10
occ-swap swap quote --from wrap.near --to usdc --amount 50
occ-swap swap quote --from wrap.near --to usdc --amount 100
```

### 3. Batch USDC Operations
Group small swaps to save on fees:
```bash
# Instead of many small swaps, accumulate and swap larger amounts
occ-swap swap quote --from wrap.near --to usdc --amount 10
```

### 4. Set USDC Thresholds
Automate swaps at target prices:
```bash
# Check if rate meets your threshold
rate=$(occ-swap swap quote --from wrap.near --to usdc --amount 1 | grep "Exchange Rate")
# Execute if rate is favorable
```

### 5. Track USDC Balance
Monitor your USDC holdings:
```bash
# After swaps, verify USDC received
occ-swap swap status --deposit-address <address>
# Check your NEAR wallet for USDC balance
```

---

## USDC Hackathon Ideas

### 1. USDC Savings Agent
Auto-convert earnings to USDC for stable savings

### 2. USDC Payment Bot
Accept any token, instantly convert to USDC

### 3. USDC Arbitrage Trader
Find price differences, trade with USDC as base

### 4. USDC Treasury Manager
Maintain organization reserves in USDC

### 5. USDC DeFi Aggregator
Route USDC through best yield opportunities

### 6. USDC Tipping Bot
Send USDC tips across platforms

### 7. USDC Subscription Service
Collect recurring payments in USDC

### 8. USDC Payroll System
Distribute salaries in stable USDC

---

## Remember

✅ **USDC is stable** - Perfect for predictable agent operations  
✅ **Always get quotes first** - Know the USDC rate before swapping  
✅ **Check status after swapping** - Confirm USDC received  
✅ **Keep keys secure** - Never expose your private key  
✅ **Use USDC as base currency** - Simplifies accounting and reduces volatility  
✅ **Monitor rates** - Get best USDC exchange rates  

💵 Happy USDC swapping!
