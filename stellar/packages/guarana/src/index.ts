import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CB7BSQKL7YKQSD6LQ46RRAFYJNZKAFGFFDKQQ5D6ZP4MG6ZYBDF7AEVU",
  }
} as const


export interface Collection {
  base_uri: Option<string>;
  name: string;
  owner: string;
  symbol: string;
}


export interface Token {
  owner: string;
  uri: string;
}


export interface TokenId {
  collection_id: u32;
  token_id: u32;
}

export interface Client {
  /**
   * Construct and simulate a create_collection transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Create a new collection
   * Returns the collection ID
   */
  create_collection: ({creator, name, symbol, base_uri}: {creator: string, name: string, symbol: string, base_uri: Option<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a mint_nft transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Mint a new NFT in an existing collection
   * Returns the token ID within the collection
   */
  mint_nft: ({minter, collection_id, to, metadata_uri}: {minter: string, collection_id: u32, to: string, metadata_uri: Option<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a transfer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Transfer an NFT to a new owner
   */
  transfer: ({from, to, collection_id, token_id}: {from: string, to: string, collection_id: u32, token_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_collection transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get collection information
   */
  get_collection: ({collection_id}: {collection_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Option<Collection>>>

  /**
   * Construct and simulate a get_token transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get token information
   */
  get_token: ({collection_id, token_id}: {collection_id: u32, token_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Option<Token>>>

  /**
   * Construct and simulate a owner_of transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get owner of a specific token
   */
  owner_of: ({collection_id, token_id}: {collection_id: u32, token_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Option<string>>>

  /**
   * Construct and simulate a tokens_of transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all tokens owned by an address
   */
  tokens_of: ({owner}: {owner: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<TokenId>>>

  /**
   * Construct and simulate a total_collections transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the total number of collections created
   */
  total_collections: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a total_tokens_in_collection transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the total number of tokens in a collection
   */
  total_tokens_in_collection: ({collection_id}: {collection_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u32>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAACkNvbGxlY3Rpb24AAAAAAAQAAAAAAAAACGJhc2VfdXJpAAAD6AAAABAAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAABnN5bWJvbAAAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAABVRva2VuAAAAAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAN1cmkAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAAB1Rva2VuSWQAAAAAAgAAAAAAAAANY29sbGVjdGlvbl9pZAAAAAAAAAQAAAAAAAAACHRva2VuX2lkAAAABA==",
        "AAAAAAAAADFDcmVhdGUgYSBuZXcgY29sbGVjdGlvbgpSZXR1cm5zIHRoZSBjb2xsZWN0aW9uIElEAAAAAAAAEWNyZWF0ZV9jb2xsZWN0aW9uAAAAAAAABAAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAGc3ltYm9sAAAAAAAQAAAAAAAAAAhiYXNlX3VyaQAAA+gAAAAQAAAAAQAAAAQ=",
        "AAAAAAAAAFNNaW50IGEgbmV3IE5GVCBpbiBhbiBleGlzdGluZyBjb2xsZWN0aW9uClJldHVybnMgdGhlIHRva2VuIElEIHdpdGhpbiB0aGUgY29sbGVjdGlvbgAAAAAIbWludF9uZnQAAAAEAAAAAAAAAAZtaW50ZXIAAAAAABMAAAAAAAAADWNvbGxlY3Rpb25faWQAAAAAAAAEAAAAAAAAAAJ0bwAAAAAAEwAAAAAAAAAMbWV0YWRhdGFfdXJpAAAD6AAAABAAAAABAAAABA==",
        "AAAAAAAAAB5UcmFuc2ZlciBhbiBORlQgdG8gYSBuZXcgb3duZXIAAAAAAAh0cmFuc2ZlcgAAAAQAAAAAAAAABGZyb20AAAATAAAAAAAAAAJ0bwAAAAAAEwAAAAAAAAANY29sbGVjdGlvbl9pZAAAAAAAAAQAAAAAAAAACHRva2VuX2lkAAAABAAAAAA=",
        "AAAAAAAAABpHZXQgY29sbGVjdGlvbiBpbmZvcm1hdGlvbgAAAAAADmdldF9jb2xsZWN0aW9uAAAAAAABAAAAAAAAAA1jb2xsZWN0aW9uX2lkAAAAAAAABAAAAAEAAAPoAAAH0AAAAApDb2xsZWN0aW9uAAA=",
        "AAAAAAAAABVHZXQgdG9rZW4gaW5mb3JtYXRpb24AAAAAAAAJZ2V0X3Rva2VuAAAAAAAAAgAAAAAAAAANY29sbGVjdGlvbl9pZAAAAAAAAAQAAAAAAAAACHRva2VuX2lkAAAABAAAAAEAAAPoAAAH0AAAAAVUb2tlbgAAAA==",
        "AAAAAAAAAB1HZXQgb3duZXIgb2YgYSBzcGVjaWZpYyB0b2tlbgAAAAAAAAhvd25lcl9vZgAAAAIAAAAAAAAADWNvbGxlY3Rpb25faWQAAAAAAAAEAAAAAAAAAAh0b2tlbl9pZAAAAAQAAAABAAAD6AAAABM=",
        "AAAAAAAAACJHZXQgYWxsIHRva2VucyBvd25lZCBieSBhbiBhZGRyZXNzAAAAAAAJdG9rZW5zX29mAAAAAAAAAQAAAAAAAAAFb3duZXIAAAAAAAATAAAAAQAAA+oAAAfQAAAAB1Rva2VuSWQA",
        "AAAAAAAAACtHZXQgdGhlIHRvdGFsIG51bWJlciBvZiBjb2xsZWN0aW9ucyBjcmVhdGVkAAAAABF0b3RhbF9jb2xsZWN0aW9ucwAAAAAAAAAAAAABAAAABA==",
        "AAAAAAAAAC5HZXQgdGhlIHRvdGFsIG51bWJlciBvZiB0b2tlbnMgaW4gYSBjb2xsZWN0aW9uAAAAAAAadG90YWxfdG9rZW5zX2luX2NvbGxlY3Rpb24AAAAAAAEAAAAAAAAADWNvbGxlY3Rpb25faWQAAAAAAAAEAAAAAQAAAAQ=" ]),
      options
    )
  }
  public readonly fromJSON = {
    create_collection: this.txFromJSON<u32>,
        mint_nft: this.txFromJSON<u32>,
        transfer: this.txFromJSON<null>,
        get_collection: this.txFromJSON<Option<Collection>>,
        get_token: this.txFromJSON<Option<Token>>,
        owner_of: this.txFromJSON<Option<string>>,
        tokens_of: this.txFromJSON<Array<TokenId>>,
        total_collections: this.txFromJSON<u32>,
        total_tokens_in_collection: this.txFromJSON<u32>
  }
}