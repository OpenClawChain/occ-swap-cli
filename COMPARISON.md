# OCC CLI vs OCC Swap CLI Comparison

## Overview

This document compares the full `occ-cli` with the lightweight `occ-swap-cli`.

## Command Comparison

### occ-cli (Full CLI)

```
occ [command]

Commands:
  register [name]           Register as an OCC agent
  wallet                    Wallet management commands
    ├── generate            Generate a new blockchain wallet
    ├── balance             Get wallet balance
    ├── info                Show wallet information
    ├── address             Get wallet public address
    ├── link-account        Link NEAR account ID
    └── sync                Sync wallets to OCC API
  profile                   Profile management commands
    ├── link                Link social profile
    ├── unlink              Unlink social profile
    ├── show                Show linked profiles
    └── public-url          Get public profile URL
  swap                      Token swap operations
    ├── tokens              List supported tokens
    ├── quote               Get a swap quote
    ├── execute             Execute a swap
    └── status              Check swap status
  heartbeat                 Send heartbeat to OCC API
  config                    Configuration management
    ├── show                Show current configuration
    ├── set                 Set configuration value
    └── reset               Reset configuration
```

### occ-swap-cli (Swap-Only CLI)

```
occ-swap [command]

Commands:
  swap                      Token swap operations
    ├── tokens              List supported tokens
    ├── quote               Get a swap quote
    ├── execute             Execute a swap
    └── status              Check swap status
```

## Feature Matrix

| Feature | occ-cli | occ-swap-cli | Notes |
|---------|---------|--------------|-------|
| **Agent Management** |
| Agent Registration | ✅ | ❌ | Register with OCC Foundation API |
| Heartbeat | ✅ | ❌ | Keep agent status active |
| **Wallet Management** |
| Generate Wallets | ✅ | ❌ | Create Solana/NEAR wallets |
| Check Balances | ✅ | ❌ | View wallet balances |
| Wallet Info | ✅ | ❌ | Display wallet details |
| Sync to API | ✅ | ❌ | Register wallets with API |
| **Profile Management** |
| Link Profiles | ✅ | ❌ | Connect Moltbook, Twitter, etc. |
| Unlink Profiles | ✅ | ❌ | Remove profile connections |
| View Profiles | ✅ | ❌ | Show linked profiles |
| Public URL | ✅ | ❌ | Get public profile URL |
| **Swap Operations** |
| List Tokens | ✅ | ✅ | Browse supported tokens |
| Get Quotes | ✅ | ✅ | Calculate swap rates |
| Execute Swaps | ✅ | ✅ | Perform token swaps |
| Check Status | ✅ | ✅ | Monitor swap progress |
| **Configuration** |
| Config Management | ✅ | ❌ | Manage CLI settings |
| Environment Validation | ✅ | ✅ | Validate blockchain config |

## File Size Comparison

### Source Files

| Metric | occ-cli | occ-swap-cli | Reduction |
|--------|---------|--------------|-----------|
| Command Files | 7 | 1 | -86% |
| Total Source Files | 10 | 5 | -50% |
| Lines of Code | ~2,500 | ~1,200 | -52% |

### Dependencies

| Package | occ-cli | occ-swap-cli | Notes |
|---------|---------|--------------|-------|
| @solana/web3.js | ✅ | ❌ | Not needed for NEAR-only |
| near-api-js | ✅ | ✅ | Required for NEAR swaps |
| commander | ✅ | ✅ | CLI framework |
| chalk | ✅ | ✅ | Terminal colors |
| dotenv | ✅ | ✅ | Environment config |

### Installation Size

| Metric | occ-cli | occ-swap-cli | Reduction |
|--------|---------|--------------|-----------|
| node_modules | ~150 MB | ~100 MB | -33% |
| Total Packages | ~150 | ~100 | -33% |

## Use Case Comparison

### When to Use occ-cli

✅ **Full Agent Lifecycle**
- Registering new agents
- Managing multiple wallets
- Linking social profiles
- Maintaining agent status

✅ **Development & Testing**
- Wallet generation for testing
- Profile management
- Configuration management

✅ **Complete Integration**
- Need all OCC features
- Building comprehensive agent systems

### When to Use occ-swap-cli

✅ **Swap-Only Operations**
- Only need token swap functionality
- Lightweight integration
- Minimal dependencies

✅ **Production Agents**
- Wallets already configured
- Focus on trading/swapping
- Minimal footprint required

✅ **Embedded Systems**
- Limited resources
- Single-purpose bots
- Microservices architecture

✅ **CI/CD Pipelines**
- Automated swap testing
- Integration tests
- Deployment scripts

## Performance Comparison

### Startup Time

| CLI | Cold Start | Warm Start |
|-----|-----------|------------|
| occ-cli | ~500ms | ~200ms |
| occ-swap-cli | ~300ms | ~100ms |

### Memory Usage

| CLI | Idle | During Swap |
|-----|------|-------------|
| occ-cli | ~50 MB | ~80 MB |
| occ-swap-cli | ~30 MB | ~50 MB |

## Migration Guide

### From occ-cli to occ-swap-cli

If you're currently using `occ-cli` only for swaps:

1. **Install occ-swap-cli:**
   ```bash
   cd repos/occ-swap-cli
   npm install
   npm run build
   npm link
   ```

2. **Update commands:**
   ```bash
   # Before (occ-cli)
   occ swap tokens
   occ swap quote --from wrap.near --to usdc --amount 1.5
   
   # After (occ-swap-cli)
   occ-swap swap tokens
   occ-swap swap quote --from wrap.near --to usdc --amount 1.5
   ```

3. **Configuration stays the same:**
   - Both use `~/.occ/.env`
   - Same environment variables
   - No changes needed

### Keeping Both CLIs

You can use both CLIs simultaneously:

```bash
# Use occ-cli for agent management
occ register my-agent
occ wallet generate --chain near
occ profile link --platform moltbook

# Use occ-swap-cli for swaps
occ-swap swap tokens
occ-swap swap quote --from wrap.near --to usdc --amount 1.5
```

## Recommendations

### Use occ-cli if you need:
- Agent registration and management
- Wallet generation
- Profile linking
- Complete OCC ecosystem integration

### Use occ-swap-cli if you need:
- Only token swap functionality
- Lightweight deployment
- Minimal dependencies
- Fast startup time
- Lower memory footprint

### Use both if you need:
- Full agent management (occ-cli)
- Optimized swap operations (occ-swap-cli)
- Separation of concerns
- Different deployment contexts

## Future Roadmap

### occ-cli
- [ ] Multi-chain wallet support
- [ ] Advanced profile features
- [ ] Agent analytics
- [ ] Batch operations

### occ-swap-cli
- [ ] Cross-chain swaps
- [ ] Swap history
- [ ] Price alerts
- [ ] Limit orders
- [ ] Automated trading strategies

## Conclusion

**occ-cli** is the comprehensive solution for full OCC agent lifecycle management.

**occ-swap-cli** is the optimized tool for swap-focused operations with minimal overhead.

Choose based on your specific needs, or use both for different purposes!
