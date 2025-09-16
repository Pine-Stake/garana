#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec,
};

const COLLECTION_COUNTER: Symbol = symbol_short!("col_cnt");
const COLLECTION_PREFIX: Symbol = symbol_short!("col");
const TOKEN_COUNTER_PREFIX: Symbol = symbol_short!("tok_cnt");
const TOKEN_PREFIX: Symbol = symbol_short!("token");
const OWNER_INDEX_PREFIX: Symbol = symbol_short!("own_idx");

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Collection {
    pub owner: Address,
    pub name: String,
    pub symbol: String,
    pub base_uri: Option<String>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Token {
    pub owner: Address,
    pub uri: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TokenId {
    pub collection_id: u32,
    pub token_id: u32,
}

#[contract]
pub struct NFTContract;

#[contractimpl]
impl NFTContract {
    /// Create a new collection
    /// Returns the collection ID
    pub fn create_collection(
        env: Env,
        creator: Address,
        name: String,
        symbol: String,
        base_uri: Option<String>,
    ) -> u32 {
        // Verify the creator signature
        creator.require_auth();

        // Get and increment collection counter
        let collection_id = env
            .storage()
            .instance()
            .get(&COLLECTION_COUNTER)
            .unwrap_or(0u32);
        let next_id = collection_id + 1;
        env.storage().instance().set(&COLLECTION_COUNTER, &next_id);

        // Create collection record
        let collection = Collection {
            owner: creator,
            name,
            symbol,
            base_uri,
        };

        // Store collection
        let collection_key = (COLLECTION_PREFIX, collection_id);
        env.storage().persistent().set(&collection_key, &collection);

        // Initialize token counter for this collection
        let token_counter_key = (TOKEN_COUNTER_PREFIX, collection_id);
        env.storage().persistent().set(&token_counter_key, &0u32);

        collection_id
    }

    /// Mint a new NFT in an existing collection
    /// Returns the token ID within the collection
    pub fn mint_nft(env: Env, minter: Address, collection_id: u32, to: Address) -> u32 {
        // Verify minter signature
        minter.require_auth();

        // Check if collection exists
        let collection_key = (COLLECTION_PREFIX, collection_id);
        let collection: Collection = env
            .storage()
            .persistent()
            .get(&collection_key)
            .expect("Collection does not exist");

        // Get and increment token counter for this collection
        let token_counter_key = (TOKEN_COUNTER_PREFIX, collection_id);
        let token_id = env
            .storage()
            .persistent()
            .get(&token_counter_key)
            .unwrap_or(0u32);
        let next_token_id = token_id + 1;
        env.storage()
            .persistent()
            .set(&token_counter_key, &next_token_id);

        // Store the base URI - clients will append token ID when needed
        let uri = match &collection.base_uri {
            Some(base) => base.clone(),
            None => String::from_str(&env, ""),
        };

        // Create token
        let token = Token {
            owner: to.clone(),
            uri,
        };

        // Store token
        let token_key = (TOKEN_PREFIX, collection_id, token_id);
        env.storage().persistent().set(&token_key, &token);

        // Update owner index
        let owner_index_key = (OWNER_INDEX_PREFIX, &to);
        let mut owned_tokens: Vec<TokenId> = env
            .storage()
            .persistent()
            .get(&owner_index_key)
            .unwrap_or(Vec::new(&env));

        owned_tokens.push_back(TokenId {
            collection_id,
            token_id,
        });
        env.storage()
            .persistent()
            .set(&owner_index_key, &owned_tokens);

        token_id
    }

    /// Transfer an NFT to a new owner
    pub fn transfer(env: Env, from: Address, to: Address, collection_id: u32, token_id: u32) {
        // Verify current owner signature
        from.require_auth();

        // Get token
        let token_key = (TOKEN_PREFIX, collection_id, token_id);
        let mut token: Token = env
            .storage()
            .persistent()
            .get(&token_key)
            .expect("Token does not exist");

        // Verify ownership
        if token.owner != from {
            panic!("Not token owner");
        }

        // Update token owner
        token.owner = to.clone();
        env.storage().persistent().set(&token_key, &token);

        // Update owner indices
        // Remove from old owner's index
        let from_index_key = (OWNER_INDEX_PREFIX, &from);
        let from_tokens: Vec<TokenId> = env
            .storage()
            .persistent()
            .get(&from_index_key)
            .unwrap_or(Vec::new(&env));

        let token_to_remove = TokenId {
            collection_id,
            token_id,
        };

        // Find and remove the token from the old owner's list
        let mut new_from_tokens = Vec::new(&env);
        for i in 0..from_tokens.len() {
            let current_token = from_tokens.get(i).unwrap();
            if current_token != token_to_remove {
                new_from_tokens.push_back(current_token);
            }
        }
        env.storage()
            .persistent()
            .set(&from_index_key, &new_from_tokens);

        // Add to new owner's index
        let to_index_key = (OWNER_INDEX_PREFIX, &to);
        let mut to_tokens: Vec<TokenId> = env
            .storage()
            .persistent()
            .get(&to_index_key)
            .unwrap_or(Vec::new(&env));

        to_tokens.push_back(TokenId {
            collection_id,
            token_id,
        });
        env.storage().persistent().set(&to_index_key, &to_tokens);
    }

    /// Get collection information
    pub fn get_collection(env: Env, collection_id: u32) -> Option<Collection> {
        let collection_key = (COLLECTION_PREFIX, collection_id);
        env.storage().persistent().get(&collection_key)
    }

    /// Get token information
    pub fn get_token(env: Env, collection_id: u32, token_id: u32) -> Option<Token> {
        let token_key = (TOKEN_PREFIX, collection_id, token_id);
        env.storage().persistent().get(&token_key)
    }

    /// Get owner of a specific token
    pub fn owner_of(env: Env, collection_id: u32, token_id: u32) -> Option<Address> {
        let token_key = (TOKEN_PREFIX, collection_id, token_id);
        let token: Option<Token> = env.storage().persistent().get(&token_key);
        token.map(|t| t.owner)
    }

    /// Get all tokens owned by an address
    pub fn tokens_of(env: Env, owner: Address) -> Vec<TokenId> {
        let owner_index_key = (OWNER_INDEX_PREFIX, &owner);
        env.storage()
            .persistent()
            .get(&owner_index_key)
            .unwrap_or(Vec::new(&env))
    }

    /// Get the total number of collections created
    pub fn total_collections(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&COLLECTION_COUNTER)
            .unwrap_or(0u32)
    }

    /// Get the total number of tokens in a collection
    pub fn total_tokens_in_collection(env: Env, collection_id: u32) -> u32 {
        let token_counter_key = (TOKEN_COUNTER_PREFIX, collection_id);
        env.storage()
            .persistent()
            .get(&token_counter_key)
            .unwrap_or(0u32)
    }
}

mod test;
