# Garana - Soroban NFT Platform

A complete NFT platform built on Stellar's Soroban smart contract platform, featuring automatic URI generation and Freighter wallet integration.

## Project Structure

```text
garana/
├── stellar/                 # Soroban smart contracts
│   ├── src/
│   │   ├── lib.rs          # NFT contract implementation
│   │   └── test.rs         # Contract tests
│   ├── Cargo.toml
│   └── target/             # Compiled contracts
└── web/                    # Next.js frontend
    ├── src/
    │   ├── app/           # Next.js app router
    │   ├── components/    # React components
    │   ├── hooks/         # Custom hooks
    │   └── lib/           # Stellar SDK integration
    ├── package.json
    └── .env.local         # Environment variables
```

## Features

### 🚀 Smart Contract Features (`stellar/`)

- **NFT Collection Creation**: Create collections with name, symbol, and base URI
- **Simplified NFT Minting**: Mint NFTs without URI parameters (auto-generated)
- **Automatic URI Generation**: URIs are created as `base_uri + token_id`
- **Ownership Tracking**: Complete token ownership and transfer system
- **Collection Management**: Query collections and token counts

### 🎨 Frontend Features (`web/`)

- **Freighter Wallet Integration**: Seamless wallet connection
- **Collection Dashboard**: Create and manage NFT collections
- **Minting Interface**: User-friendly NFT minting with real-time feedback
- **NFT Explorer**: Browse all collections and tokens
- **Transaction Tracking**: Direct links to Stellar Expert
- **Responsive Design**: Works on desktop and mobile

## Quick Start

### 1. Smart Contract Development

```bash
cd stellar
cargo test                    # Run contract tests
stellar contract build        # Build contract
stellar contract optimize --wasm target/wasm32v1-none/release/guarana.wasm
stellar contract deploy --wasm target/wasm32v1-none/release/guarana.optimized.wasm --source YOUR_SECRET_KEY --network testnet
```

### 2. Frontend Development

```bash
cd web
npm install                   # Install dependencies
npm run dev                   # Start development server
```

Visit `http://localhost:3000/nft` to access the NFT platform.

### 3. Environment Setup

Create `web/.env.local`:

```bash
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
NEXT_PUBLIC_CONTRACT_ID=YOUR_CONTRACT_ID
```

## Contract Details

### Latest Deployment

- **Contract ID**: `CBQOMU3JVKPFKN5SVP7XN6OEURNKF2NBP76UCNWT3IPBSNUIQ6VPJX4Q`
- **Network**: Stellar Testnet
- **Features**: Auto-generated URIs, simplified minting

### Contract Functions

#### Collection Management

```rust
create_collection(creator: Address, name: String, symbol: String, base_uri: Option<String>) -> u32
get_collection(collection_id: u32) -> Collection
total_collections() -> u32
```

#### NFT Operations

```rust
mint_nft(minter: Address, collection_id: u32, to: Address) -> u32
get_token(collection_id: u32, token_id: u32) -> Token
total_tokens_in_collection(collection_id: u32) -> u32
transfer(from: Address, to: Address, collection_id: u32, token_id: u32)
```

#### Ownership Queries

```rust
owner_of(collection_id: u32, token_id: u32) -> Address
tokens_of(owner: Address) -> Vec<TokenId>
```

## How It Works

### 1. Automatic URI Generation

- When creating a collection, specify a `base_uri` (e.g., "https://api.myart.com/")
- When minting NFTs, URIs are automatically generated as `base_uri + token_id`
- Token 0: "https://api.myart.com/0"
- Token 1: "https://api.myart.com/1"
- Token 2: "https://api.myart.com/2"

### 2. Simplified Minting

**Old way** (with URI parameter):

```bash
mint_nft(minter, collection_id, recipient, "custom-uri.json")
```

**New way** (auto-generated):

```bash
mint_nft(minter, collection_id, recipient)
```

### 3. Frontend Integration

- Connect Freighter wallet
- Create collections with base URIs
- Mint NFTs with automatic URI generation
- Browse and explore all NFTs on the platform

## Development Commands

### Contract Commands (`stellar/`)

```bash
cargo test                                    # Run tests
cargo build                                   # Build for development
stellar contract build                        # Build for deployment
stellar contract optimize --wasm TARGET       # Optimize contract
stellar contract deploy --wasm WASM --source SECRET --network testnet
```

### Frontend Commands (`web/`)

```bash
npm run dev                                   # Development server
npm run build                                 # Production build
npm run start                                 # Start production server
npm run lint                                  # Run linting
```

## Technology Stack

- **Smart Contracts**: Rust + Soroban SDK
- **Frontend**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Wallet**: Freighter integration
- **Network**: Stellar Testnet

## Examples

### Create a Collection

```javascript
const { createCollection } = useNFTContract();
const result = await createCollection(
  "Digital Art Collection",
  "DAC",
  "https://api.digitalart.com/"
);
```

### Mint an NFT

```javascript
const { mintNFT } = useNFTContract();
const result = await mintNFT(0, "GXXXXXXX..."); // Collection 0, recipient address
// Result: Token with URI "https://api.digitalart.com/0"
```

### Query NFTs

```javascript
const { getToken } = useNFTContract();
const token = await getToken(0, 0); // Collection 0, Token 0
// Returns: { owner: "GXXXXX...", uri: "https://api.digitalart.com/0" }
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (both contract and frontend)
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
