# HarmonyAI Solana Program Tests

This directory contains test files for the Solana programs used by the HarmonyAI platform.

## Test Files

- **token-program.test.ts**: Tests for the HAI token program, including minting, transferring tokens, and checking balances.
- **survey-program.test.ts**: Tests for the survey program, including creating surveys, submitting responses, and claiming rewards.

## Running Tests

To run these tests, you'll need to have a local Solana validator running. Follow these steps:

1. Start a local Solana validator in a separate terminal:
   ```bash
   solana-test-validator
   ```

2. Run the tests using Anchor:
   ```bash
   anchor test
   ```

   Or using Mocha directly:
   ```bash
   npm run test:contracts
   ```

## Test Configuration

The tests are configured to run against a local Solana validator. If you want to run tests against other networks (such as devnet), you'll need to modify the connection parameters in the test files.

## Mocking

Some tests use mocking to simulate blockchain operations without actually deploying contracts. This is useful for faster test execution and for testing edge cases that might be difficult to reproduce in a real environment.

## Dependencies

- **@solana/web3.js**: Solana JavaScript API
- **@project-serum/anchor**: Framework for Solana smart contract development
- **assert**: Node.js assertion library for test validation

## Troubleshooting

If you encounter issues running the tests:

1. Make sure your local validator is running
2. Check that you have the latest Solana CLI tools installed
3. Verify that your Node.js environment has all required dependencies installed
4. Try resetting your local validator with `solana-test-validator --reset`
