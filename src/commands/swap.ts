import { Command } from 'commander';
import { loadConfig, isSupportedBlockchain, validateBlockchainEnv, SUPPORTED_BLOCKCHAINS } from '../config';
import { SwapApiClient } from '../swap-api-client';
import { signAndSendMultipleTransactions } from '../near-signer';
import { getTokens, findToken, saveTokensToCache, loadTokensFromCache, isCacheExpired } from '../token-cache';
import type { Token } from '../token-cache';
import chalk from 'chalk';

// Helper function to convert amount to smallest unit without scientific notation
function toSmallestUnit(amount: number, decimals: number): string {
  // Convert to string with enough precision
  const amountStr = amount.toFixed(decimals);
  const [whole = '0', fraction = ''] = amountStr.split('.');
  
  // Pad fraction to match decimals
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  
  // Combine whole and fraction parts
  const combined = whole + paddedFraction;
  
  // Remove leading zeros but keep at least one digit
  return BigInt(combined).toString();
}

export function createSwapCommand(): Command {
  const swap = new Command('swap');
  swap.description('Token swap operations using NEAR Intents');

  // List tokens
  swap
    .command('tokens')
    .description('List supported tokens for swapping')
    .option('-b, --blockchain <blockchain>', 'Filter by blockchain (near, ethereum, solana, etc.)')
    .option('-s, --symbol <symbol>', 'Filter by token symbol')
    .option('--refresh', 'Force refresh token cache')
    .action(async (options) => {
      try {
        const client = new SwapApiClient();
        
        let tokens: Token[];
        
        if (options.refresh) {
          // Force refresh from API
          console.log(chalk.cyan('Refreshing token cache...'));
          const response = await client.getTokens();
          saveTokensToCache(response.tokens, response.expiresAt);
          tokens = response.tokens;
          console.log(chalk.green(`✓ Cached ${tokens.length} tokens\n`));
        } else {
          // Use cache or fetch if expired
          tokens = await getTokens(() => client.getTokens());
          
          const cache = loadTokensFromCache();
          if (cache && !isCacheExpired(cache)) {
            console.log(chalk.gray(`Using cached tokens (updated: ${new Date(cache.lastUpdated).toLocaleString()})\n`));
          }
        }

        if (options.blockchain) {
          tokens = tokens.filter((t: Token) => 
            t.blockchain.toLowerCase() === options.blockchain.toLowerCase()
          );
        }

        if (options.symbol) {
          tokens = tokens.filter((t: Token) => 
            t.symbol.toLowerCase().includes(options.symbol.toLowerCase())
          );
        }

        if (tokens.length === 0) {
          console.log(chalk.yellow('No tokens found'));
          return;
        }

        console.log(chalk.cyan(`Supported Tokens (${tokens.length}):`));
        console.log(chalk.gray('─'.repeat(80)));
        
        tokens.forEach((token: Token) => {
          console.log(
            chalk.white(token.symbol.padEnd(10)) +
            chalk.gray(token.name.padEnd(30)) +
            chalk.blue(token.blockchain.padEnd(15)) +
            chalk.gray(`${token.decimals} decimals`)
          );
        });
        
        console.log(chalk.gray('─'.repeat(80)));
        
        if (!options.refresh) {
          console.log(chalk.gray('\nTip: Use --refresh to update token cache'));
        }
      } catch (error) {
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  // Get quote
  swap
    .command('quote')
    .description('Get a swap quote')
    .requiredOption('--from <token>', 'From token (e.g., wrap.near, usdc)')
    .requiredOption('--to <token>', 'To token (e.g., usdc, usdt)')
    .requiredOption('--amount <amount>', 'Amount to swap (in token units, e.g., 1.5)')
    .option('--from-chain <chain>', 'From blockchain', 'near')
    .option('--to-chain <chain>', 'To blockchain', 'near')
    .option('--recipient <address>', 'Recipient address (defaults to your NEAR account)')
    .option('--refund <address>', 'Refund address (defaults to your NEAR account)')
    .option('--dry', 'Dry run mode (test with mock addresses)')
    .action(async (options) => {
      try {
        const config = loadConfig();
        
        // Normalize blockchain names to lowercase
        const fromChain = options.fromChain.toLowerCase();
        const toChain = options.toChain.toLowerCase();
        
        // Validate blockchain support
        if (!isSupportedBlockchain(fromChain)) {
          console.error(chalk.red(`✗ Blockchain "${fromChain}" is not currently supported`));
          console.log(chalk.yellow(`\nCurrently supported blockchains: ${SUPPORTED_BLOCKCHAINS.join(', ')}`));
          console.log(chalk.gray('Cross-chain swaps will be available in future releases.'));
          process.exit(1);
        }
        
        if (!isSupportedBlockchain(toChain)) {
          console.error(chalk.red(`✗ Blockchain "${toChain}" is not currently supported`));
          console.log(chalk.yellow(`\nCurrently supported blockchains: ${SUPPORTED_BLOCKCHAINS.join(', ')}`));
          console.log(chalk.gray('Cross-chain swaps will be available in future releases.'));
          process.exit(1);
        }
        
        // Validate environment variables for both chains
        const fromChainValidation = validateBlockchainEnv(fromChain, config);
        const toChainValidation = validateBlockchainEnv(toChain, config);
        
        if (!fromChainValidation.valid) {
          console.error(chalk.red(`✗ Missing ${fromChain.toUpperCase()} configuration`));
          console.log(chalk.yellow('\nRequired environment variables in ~/.occ/.env:'));
          fromChainValidation.missingVars.forEach(v => console.log(chalk.white(`  ${v}`)));
          process.exit(1);
        }
        
        if (!toChainValidation.valid) {
          console.error(chalk.red(`✗ Missing ${toChain.toUpperCase()} configuration`));
          console.log(chalk.yellow('\nRequired environment variables in ~/.occ/.env:'));
          toChainValidation.missingVars.forEach(v => console.log(chalk.white(`  ${v}`)));
          process.exit(1);
        }
        
        const client = new SwapApiClient();
        
        // Find token with blockchain filter
        const fromToken = findToken(options.from, fromChain);
        
        if (!fromToken) {
          console.error(chalk.red(`Token "${options.from}" not found on ${fromChain}`));
          console.log(chalk.yellow('Run: occ swap tokens --refresh'));
          process.exit(1);
        }

        const toToken = findToken(options.to, toChain);
        
        if (!toToken) {
          console.error(chalk.red(`Token "${options.to}" not found on ${toChain}`));
          console.log(chalk.yellow('Run: occ swap tokens --refresh'));
          process.exit(1);
        }

        // Convert amount to smallest unit
        const amount = parseFloat(options.amount);
        const smallestUnit = toSmallestUnit(amount, fromToken.decimals);

        // Use NEAR account from config or provided addresses
        // Priority: CLI option > env NEAR_RECIPIENT_ADDRESS > env NEAR_ACCOUNT_ADDRESS > default
        const recipient = options.recipient || 
                         config.nearRecipientAddress || 
                         config.nearAccountAddress ||
                         config.nearPublicKey || 
                         'your-account.near';
        const refund = options.refund || 
                      config.nearRefundAddress || 
                      config.nearAccountAddress ||
                      config.nearPublicKey || 
                      'your-account.near';

        console.log(chalk.gray(`From: ${fromToken.symbol} (${fromToken.assetId})`));
        console.log(chalk.gray(`To: ${toToken.symbol} (${toToken.assetId})`));
        console.log(chalk.gray(`Amount: ${amount} ${fromToken.symbol} = ${smallestUnit} (smallest unit)\n`));

        const quote = await client.getQuote({
          fromToken: fromToken.assetId,
          toToken: toToken.assetId,
          amount: smallestUnit,
          recipientAddress: recipient,
          refundAddress: refund,
          dry: options.dry || false,
        });

        console.log(chalk.cyan('Swap Quote'));
        console.log(chalk.gray('─'.repeat(80)));
        console.log(chalk.white('Deposit Address:'), chalk.yellow(quote.depositAddress));
        if (quote.memo) {
          console.log(chalk.white('Memo:'), chalk.yellow(quote.memo));
        }
        console.log(chalk.white('Expected Output:'), chalk.green(quote.expectedOutput));
        console.log(chalk.white('Exchange Rate:'), chalk.blue(quote.exchangeRate));
        console.log(chalk.white('Fees:'), chalk.gray(quote.fees));
        console.log(chalk.white('Expires At:'), chalk.gray(new Date(quote.expiresAt * 1000).toISOString()));
        console.log(chalk.gray('─'.repeat(80)));

        if (options.dry) {
          console.log(chalk.yellow('\n⚠️  This is a DRY RUN with mock addresses'));
        }

        console.log(chalk.cyan('\nTo execute this swap, run:'));
        console.log(chalk.white(`occ swap execute --deposit-address ${quote.depositAddress} --amount ${amount} --from ${options.from}`));
      } catch (error) {
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  // Execute swap
  swap
    .command('execute')
    .description('Execute a swap (NEAR tokens only)')
    .requiredOption('--deposit-address <address>', 'Deposit address from quote')
    .requiredOption('--amount <amount>', 'Amount to swap (in token units)')
    .requiredOption('--from <token>', 'From token symbol')
    .option('--from-chain <chain>', 'From blockchain', 'near')
    .option('--memo <memo>', 'Optional memo')
    .action(async (options) => {
      try {
        const config = loadConfig();
        
        // Normalize blockchain name to lowercase
        const fromChain = options.fromChain.toLowerCase();
        
        // Validate blockchain support
        if (!isSupportedBlockchain(fromChain)) {
          console.error(chalk.red(`✗ Blockchain "${fromChain}" is not currently supported`));
          console.log(chalk.yellow(`\nCurrently supported blockchains: ${SUPPORTED_BLOCKCHAINS.join(', ')}`));
          console.log(chalk.gray('Cross-chain swaps will be available in future releases.'));
          process.exit(1);
        }
        
        // Validate environment variables
        const validation = validateBlockchainEnv(fromChain, config);
        
        if (!validation.valid) {
          console.error(chalk.red(`✗ Missing ${fromChain.toUpperCase()} configuration`));
          console.log(chalk.yellow('\nRequired environment variables in ~/.occ/.env:'));
          validation.missingVars.forEach(v => console.log(chalk.white(`  ${v}`)));
          process.exit(1);
        }

        // Swaps only work on mainnet
        const network = 'mainnet';
        const rpcUrl = 'https://rpc.mainnet.near.org';
        
        // Get mainnet credentials with fallback to legacy format
        const nearAccount = config.nearMainnetAccountAddress || config.nearAccountAddress;
        const nearPrivateKey = config.nearMainnetPrivateKey || config.nearPrivateKey;

        if (!nearAccount || !nearPrivateKey) {
          console.error(chalk.red('Error: NEAR mainnet credentials not configured'));
          console.log(chalk.yellow('Add to ~/.occ/.env:'));
          console.log(chalk.white('NEAR_MAINNET_ACCOUNT_ADDRESS=your-account.near'));
          console.log(chalk.white('NEAR_MAINNET_PRIVATE_KEY=ed25519:...'));
          console.log(chalk.gray('\nOr use legacy format:'));
          console.log(chalk.white('NEAR_ACCOUNT_ADDRESS=your-account.near'));
          console.log(chalk.white('NEAR_PRIVATE_KEY=ed25519:...'));
          process.exit(1);
        }

        const client = new SwapApiClient();
        
        // Get token info from cache with blockchain filter
        const fromToken = findToken(options.from, fromChain);
        
        if (!fromToken) {
          console.error(chalk.red(`Token "${options.from}" not found on ${fromChain}`));
          console.log(chalk.yellow('Run: occ swap tokens --refresh'));
          process.exit(1);
        }

        if (!fromToken.assetId.startsWith('nep141:')) {
          console.error(chalk.red('Error: Execute command only supports NEAR tokens (nep141:*)'));
          console.log(chalk.yellow('For other blockchains, use your native wallet to send tokens to the deposit address'));
          process.exit(1);
        }

        // Convert amount to smallest unit
        const amount = parseFloat(options.amount);
        const smallestUnit = toSmallestUnit(amount, fromToken.decimals);

        console.log(chalk.gray(`Token: ${fromToken.symbol} (${fromToken.assetId})`));
        console.log(chalk.gray(`Amount: ${amount} ${fromToken.symbol} = ${smallestUnit} (smallest unit)\n`));

        console.log(chalk.cyan('Step 1: Getting unsigned transactions...'));
        
        const executeResponse = await client.executeSwap({
          depositAddress: options.depositAddress,
          amount: smallestUnit,
          fromToken: fromToken.assetId,
          memo: options.memo,
        });

        console.log(chalk.gray(`Token Contract: ${executeResponse.tokenContract}`));
        console.log(chalk.gray(`Transactions: ${executeResponse.transactions.length}`));

        console.log(chalk.cyan('\nStep 2: Signing and sending transactions...'));

        const txHashes = await signAndSendMultipleTransactions(
          nearAccount,
          nearPrivateKey,
          executeResponse.transactions,
          network,
          rpcUrl
        );

        console.log(chalk.green('✓ Transactions sent successfully!\n'));
        console.log(chalk.white('Storage Registration TX:'), chalk.yellow(txHashes[0]));
        console.log(chalk.white('Token Transfer TX:'), chalk.yellow(txHashes[1]));

        console.log(chalk.cyan('\nStep 3: Submitting to API...'));

        await client.submitDeposit({
          depositAddress: options.depositAddress,
          transactionHash: txHashes[1],
          memo: options.memo,
        });

        console.log(chalk.green('✓ Swap submitted successfully!'));
        console.log(chalk.cyan('\nCheck status with:'));
        console.log(chalk.white(`occ swap status --deposit-address ${options.depositAddress}`));
      } catch (error) {
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  // Check status
  swap
    .command('status')
    .description('Check swap status')
    .requiredOption('--deposit-address <address>', 'Deposit address')
    .option('--memo <memo>', 'Memo (for certain chains)')
    .action(async (options) => {
      try {
        const client = new SwapApiClient();
        const status = await client.getStatus(options.depositAddress, options.memo);

        console.log(chalk.cyan('Swap Status'));
        console.log(chalk.gray('─'.repeat(80)));
        console.log(chalk.white('Status:'), getStatusColor(status.status));
        if (status.transactionHash) {
          console.log(chalk.white('Transaction Hash:'), chalk.yellow(status.transactionHash));
        }
        if (status.timestamp) {
          console.log(chalk.white('Timestamp:'), chalk.gray(status.timestamp));
        }
        if (status.message) {
          console.log(chalk.white('Message:'), chalk.gray(status.message));
        }
        console.log(chalk.gray('─'.repeat(80)));
      } catch (error) {
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  return swap;
}

function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'SUCCESS':
      return chalk.green(status);
    case 'PENDING':
    case 'PENDING_DEPOSIT':
    case 'PROCESSING':
      return chalk.yellow(status);
    case 'FAILED':
    case 'ERROR':
      return chalk.red(status);
    default:
      return chalk.gray(status);
  }
}
