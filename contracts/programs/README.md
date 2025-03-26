# HarmonyAI Solana Programs

This directory contains the Solana programs (smart contracts) used by the HarmonyAI platform.

## Programs Overview

- **HarmonyTokenProgram.ts**: Handles token-related operations such as minting HAI tokens, transferring tokens, and checking token balances.
- **SurveyProgram.ts**: Manages survey lifecycle including creation, participation, and reward distribution.

## Development Setup

To develop and test these contracts, you'll need to:

1. Install Solana development tools:
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.16.10/install)"
   ```

2. Install Anchor framework:
   ```bash
   npm install -g @project-serum/anchor
   ```

3. Initialize a local Solana validator:
   ```bash
   solana-test-validator
   ```

## Building and Deploying

To build and deploy these programs to the Solana network:

1. Build the programs:
   ```bash
   anchor build
   ```

2. Deploy to a network (default is localhost):
   ```bash
   anchor deploy
   ```

3. For deploying to devnet or mainnet:
   ```bash
   anchor deploy --provider.cluster devnet
   ```

## Contract Integration

These contracts are integrated with the frontend application through the Web3.js library and custom hooks. See the `app/hooks` directory for the integration code.

## Program IDs

- Token Program: `HAiTokenPub1ictF9KQKRzehXzGKzPGp3JdT7zJsEZ4WEmw8`
- Survey Program: `SuRVEYzQvHZ3bzDkZKkpY1z1BsCN3K8PdVV7ANs7W4t`

Note: These are placeholder Program IDs and will be updated when the programs are deployed to the actual network.
