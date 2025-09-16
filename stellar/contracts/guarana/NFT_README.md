# Soroban NFT Contract

A simple but comprehensive NFT (Non-Fungible Token) contract built on Soroban that allows anyone to create collections and mint NFTs without payments, royalties, or allowlists.

## Features

### Core Functionality

- **Collection Creation**: Anyone can create a named NFT collection with a symbol and optional base URI
- **NFT Minting**: Mint NFTs in any existing collection with custom or auto-generated metadata URIs
- **Token Transfers**: Transfer NFTs between addresses with proper ownership verification
- **Ownership Tracking**: Complete ownership tracking and indexing system

### Key Characteristics

- **Permissionless**: No restrictions on who can create collections or mint NFTs
- **Gas Efficient**: Uses efficient storage patterns with prefixed keys
- **Owner Indexing**: Fast lookup of all tokens owned by an address
- **Metadata Flexible**: Supports both custom URIs and base URI + token ID patterns

## Contract Structure

### Data Types

```rust
#[contracttype]
pub struct Collection {
    pub owner: Address,      // Collection creator
    pub name: String,        // Human-readable name
    pub symbol: String,      // Short symbol (e.g., "MYNFT")
    pub base_uri: Option<String>, // Optional base URI for metadata
}

#[contracttype]
pub struct Token {
    pub owner: Address,      // Current token owner
    pub uri: String,         // Metadata URI
}

#[contracttype]
pub struct TokenId {
    pub collection_id: u32,  // Collection identifier
    pub token_id: u32,       // Token identifier within collection
}
```

### Storage Schema

The contract uses a well-organized storage schema with prefixed keys:

| Storage Key                        | Value Type     | Purpose                      |
| ---------------------------------- | -------------- | ---------------------------- |
| `col_cnt`                          | `u32`          | Global collection counter    |
| `col:{id}`                         | `Collection`   | Collection metadata          |
| `tok_cnt:{collection_id}`          | `u32`          | Token counter per collection |
| `token:{collection_id}:{token_id}` | `Token`        | Individual NFT data          |
| `own_idx:{owner}`                  | `Vec<TokenId>` | Tokens owned by address      |

## Contract Functions

### Collection Management

#### `create_collection`

Creates a new NFT collection.

```rust
pub fn create_collection(
    env: Env,
    creator: Address,           // Collection creator (must sign)
    name: String,              // Collection name
    symbol: String,            // Collection symbol
    base_uri: Option<String>   // Optional base URI for metadata
) -> u32                       // Returns collection ID
```

**Example Usage:**

```rust
let collection_id = contract.create_collection(
    &creator,
    &String::from_str(&env, "My Art Collection"),
    &String::from_str(&env, "ART"),
    &Some(String::from_str(&env, "https://api.myart.com/metadata/"))
);
```

### NFT Management

#### `mint_nft`

Mints a new NFT in an existing collection.

```rust
pub fn mint_nft(
    env: Env,
    minter: Address,               // Minter (must sign)
    collection_id: u32,            // Target collection
    to: Address,                   // NFT recipient
    metadata_uri: Option<String>   // Custom URI or use base_uri
) -> u32                          // Returns token ID
```

**Example Usage:**

```rust
// Mint with custom metadata URI
let token_id = contract.mint_nft(
    &minter,
    &collection_id,
    &recipient,
    &Some(String::from_str(&env, "custom_metadata.json"))
);

// Mint using collection's base URI
let token_id = contract.mint_nft(
    &minter,
    &collection_id,
    &recipient,
    &None  // Will use base_uri if available
);
```

#### `transfer`

Transfers an NFT to a new owner.

```rust
pub fn transfer(
    env: Env,
    from: Address,          // Current owner (must sign)
    to: Address,            // New owner
    collection_id: u32,     // Collection ID
    token_id: u32          // Token ID
)
```

### Query Functions

#### `get_collection`

Returns collection information.

```rust
pub fn get_collection(env: Env, collection_id: u32) -> Option<Collection>
```

#### `get_token`

Returns token information.

```rust
pub fn get_token(env: Env, collection_id: u32, token_id: u32) -> Option<Token>
```

#### `owner_of`

Returns the owner of a specific token.

```rust
pub fn owner_of(env: Env, collection_id: u32, token_id: u32) -> Option<Address>
```

#### `tokens_of`

Returns all tokens owned by an address.

```rust
pub fn tokens_of(env: Env, owner: Address) -> Vec<TokenId>
```

#### `total_collections`

Returns the total number of collections created.

```rust
pub fn total_collections(env: Env) -> u32
```

#### `total_tokens_in_collection`

Returns the total number of tokens in a specific collection.

```rust
pub fn total_tokens_in_collection(env: Env, collection_id: u32) -> u32
```

## Usage Flows

### 1. Creating a Collection

```rust
let creator = Address::generate(&env);
let collection_id = contract.create_collection(
    &creator,
    &String::from_str(&env, "Digital Art Collection"),
    &String::from_str(&env, "DART"),
    &Some(String::from_str(&env, "https://api.digitalart.com/"))
);
```

### 2. Minting NFTs

```rust
// Mint to yourself
let token_id = contract.mint_nft(
    &creator,
    &collection_id,
    &creator,
    &Some(String::from_str(&env, "artwork1.json"))
);

// Mint to someone else
let recipient = Address::generate(&env);
let token_id = contract.mint_nft(
    &creator,
    &collection_id,
    &recipient,
    &Some(String::from_str(&env, "artwork2.json"))
);
```

### 3. Transferring NFTs

```rust
let new_owner = Address::generate(&env);
contract.transfer(&current_owner, &new_owner, &collection_id, &token_id);
```

### 4. Querying Ownership

```rust
// Check who owns a specific token
let owner = contract.owner_of(&collection_id, &token_id);

// Get all tokens owned by an address
let owned_tokens = contract.tokens_of(&owner_address);
```

## Security Considerations

1. **Authentication**: All state-changing functions require proper signature authentication
2. **Ownership Verification**: Transfers verify current ownership before execution
3. **Existence Checks**: Functions validate that collections and tokens exist
4. **No Reentrancy**: Simple storage patterns prevent reentrancy attacks

## Deployment and Testing

### Running Tests

```bash
cd contracts/guarana
cargo test
```

### Building the Contract

```bash
cargo build --target wasm32-unknown-unknown --release
```

## Limitations and Future Enhancements

### Current Limitations

- No approval/allowance system (transfers require direct owner signature)
- No enumeration limits (large collections might be gas-intensive to query)
- Simple URI concatenation (no advanced metadata management)

### Potential Enhancements

- Add approval system for marketplace integration
- Implement pagination for large collections
- Add royalty support
- Add collection-level permissions
- Implement batch operations
- Add metadata validation

## Gas Efficiency

The contract is designed for gas efficiency:

- **Minimal Storage**: Only essential data is stored
- **Efficient Indexing**: Owner index allows fast ownership queries
- **Batched Operations**: Single transactions can be used for multiple operations
- **Persistent Storage**: Uses appropriate storage types for different data lifetime needs

## Integration Examples

### Frontend Integration

```javascript
// Create collection
const collectionId = await contract.create_collection({
  creator: userAddress,
  name: "My Collection",
  symbol: "MC",
  base_uri: "https://api.example.com/",
});

// Mint NFT
const tokenId = await contract.mint_nft({
  minter: userAddress,
  collection_id: collectionId,
  to: recipientAddress,
  metadata_uri: "custom.json",
});
```

### Marketplace Integration

```rust
// List all tokens owned by a user
let user_tokens = contract.tokens_of(&user_address);

// Transfer token (after marketplace agreement)
contract.transfer(&seller, &buyer, &collection_id, &token_id);
```

This contract provides a solid foundation for NFT functionality on Soroban while maintaining simplicity and gas efficiency.
