#!/usr/bin/env node

import { Command } from 'commander';
import { createSwapCommand } from './commands/swap';

const program = new Command();

program
  .name('occ-swap')
  .description('OpenClawChain Swap CLI - Token swaps on NEAR blockchain')
  .version('1.0.0');

// Add swap command
program.addCommand(createSwapCommand());

// Parse arguments
program.parse(process.argv);
