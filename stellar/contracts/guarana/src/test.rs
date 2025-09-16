#![cfg(test)]

use super::*;
use soroban_sdk::{log, testutils::Address as _, Address, Env, String};

#[test]
fn test_create_collection() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(NFTContract, ());
    let client = NFTContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let name = String::from_str(&env, "My NFT Collection");
    let symbol = String::from_str(&env, "MNC");
    let base_uri = Some(String::from_str(&env, "https://api.mynft.com/metadata/"));

    let collection_id = client.create_collection(&creator, &name, &symbol, &base_uri);
    assert_eq!(collection_id, 0);

    // Verify collection was created
    let collection = client.get_collection(&collection_id).unwrap();
    log!(&env, "Collection created: {:?}", collection);
    assert_eq!(collection.owner, creator);
    assert_eq!(collection.name, name);
    assert_eq!(collection.symbol, symbol);
    assert_eq!(collection.base_uri, base_uri);

    // Check total collections
    assert_eq!(client.total_collections(), 1);
}

#[test]
fn test_create_multiple_collections() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(NFTContract, ());
    let client = NFTContractClient::new(&env, &contract_id);

    let creator1 = Address::generate(&env);
    let creator2 = Address::generate(&env);

    // Create first collection
    let collection_id1 = client.create_collection(
        &creator1,
        &String::from_str(&env, "Collection 1"),
        &String::from_str(&env, "COL1"),
        &None,
    );

    // Create second collection
    let collection_id2 = client.create_collection(
        &creator2,
        &String::from_str(&env, "Collection 2"),
        &String::from_str(&env, "COL2"),
        &Some(String::from_str(&env, "https://example.com/")),
    );

    assert_eq!(collection_id1, 0);
    assert_eq!(collection_id2, 1);
    assert_eq!(client.total_collections(), 2);
}

#[test]
fn test_mint_nft() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(NFTContract, ());
    let client = NFTContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let minter = Address::generate(&env);
    let recipient = Address::generate(&env);

    // Create collection first
    let collection_id = client.create_collection(
        &creator,
        &String::from_str(&env, "Test Collection"),
        &String::from_str(&env, "TEST"),
        &Some(String::from_str(&env, "https://api.test.com/")),
    );

    // Mint NFT (no URI parameter - auto-generated)
    let token_id = client.mint_nft(&minter, &collection_id, &recipient);

    assert_eq!(token_id, 0);

    // Verify token was minted
    let token = client.get_token(&collection_id, &token_id).unwrap();
    assert_eq!(token.owner, recipient);
    // URI should be the base URI (collection handles URI generation)
    assert_eq!(token.uri, String::from_str(&env, "https://api.test.com/"));

    // Verify ownership
    assert_eq!(
        client.owner_of(&collection_id, &token_id).unwrap(),
        recipient
    );

    // Check tokens owned by recipient
    let owned_tokens = client.tokens_of(&recipient);
    assert_eq!(owned_tokens.len(), 1);
    assert_eq!(
        owned_tokens.get(0).unwrap(),
        TokenId {
            collection_id,
            token_id,
        }
    );

    // Check total tokens in collection
    assert_eq!(client.total_tokens_in_collection(&collection_id), 1);
}

#[test]
fn test_mint_nft_with_base_uri() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(NFTContract, ());
    let client = NFTContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let recipient = Address::generate(&env);

    // Create collection with base URI
    let collection_id = client.create_collection(
        &creator,
        &String::from_str(&env, "Test Collection"),
        &String::from_str(&env, "TEST"),
        &Some(String::from_str(&env, "https://api.test.com/metadata/")),
    );

    // Mint NFT (auto-generated URI using base_uri)
    let token_id = client.mint_nft(&creator, &collection_id, &recipient);

    let token = client.get_token(&collection_id, &token_id).unwrap();
    // Token should be created with the base URI
    assert_eq!(token.owner, recipient);
    assert_eq!(
        token.uri,
        String::from_str(&env, "https://api.test.com/metadata/")
    );
}

#[test]
fn test_transfer_nft() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(NFTContract, ());
    let client = NFTContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let original_owner = Address::generate(&env);
    let new_owner = Address::generate(&env);

    // Create collection and mint NFT
    let collection_id = client.create_collection(
        &creator,
        &String::from_str(&env, "Test Collection"),
        &String::from_str(&env, "TEST"),
        &None,
    );

    let token_id = client.mint_nft(&creator, &collection_id, &original_owner);

    // Transfer NFT
    client.transfer(&original_owner, &new_owner, &collection_id, &token_id);

    // Verify transfer
    let token = client.get_token(&collection_id, &token_id).unwrap();
    assert_eq!(token.owner, new_owner);
    assert_eq!(
        client.owner_of(&collection_id, &token_id).unwrap(),
        new_owner
    );

    // Check owner indices
    let original_tokens = client.tokens_of(&original_owner);
    let new_tokens = client.tokens_of(&new_owner);

    assert_eq!(original_tokens.len(), 0);
    assert_eq!(new_tokens.len(), 1);
    assert_eq!(
        new_tokens.get(0).unwrap(),
        TokenId {
            collection_id,
            token_id,
        }
    );
}

#[test]
fn test_multiple_nfts_in_collection() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(NFTContract, ());
    let client = NFTContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let owner1 = Address::generate(&env);
    let owner2 = Address::generate(&env);

    // Create collection
    let collection_id = client.create_collection(
        &creator,
        &String::from_str(&env, "Multi NFT Collection"),
        &String::from_str(&env, "MULTI"),
        &None,
    );

    // Mint multiple NFTs
    let token_id1 = client.mint_nft(&creator, &collection_id, &owner1);
    let token_id2 = client.mint_nft(&creator, &collection_id, &owner2);
    let token_id3 = client.mint_nft(&creator, &collection_id, &owner1);

    assert_eq!(token_id1, 0);
    assert_eq!(token_id2, 1);
    assert_eq!(token_id3, 2);

    // Check total tokens in collection
    assert_eq!(client.total_tokens_in_collection(&collection_id), 3);

    // Check ownership
    let owner1_tokens = client.tokens_of(&owner1);
    let owner2_tokens = client.tokens_of(&owner2);

    assert_eq!(owner1_tokens.len(), 2);
    assert_eq!(owner2_tokens.len(), 1);
}

#[test]
#[should_panic(expected = "Collection does not exist")]
fn test_mint_in_nonexistent_collection() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(NFTContract, ());
    let client = NFTContractClient::new(&env, &contract_id);

    let minter = Address::generate(&env);
    let recipient = Address::generate(&env);

    // Try to mint in collection that doesn't exist
    client.mint_nft(&minter, &999, &recipient);
}

#[test]
#[should_panic(expected = "Not token owner")]
fn test_transfer_not_owner() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(NFTContract, ());
    let client = NFTContractClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let owner = Address::generate(&env);
    let not_owner = Address::generate(&env);
    let recipient = Address::generate(&env);

    // Create collection and mint NFT
    let collection_id = client.create_collection(
        &creator,
        &String::from_str(&env, "Test Collection"),
        &String::from_str(&env, "TEST"),
        &None,
    );

    let token_id = client.mint_nft(&creator, &collection_id, &owner);

    // Try to transfer from wrong owner
    client.transfer(&not_owner, &recipient, &collection_id, &token_id);
}
