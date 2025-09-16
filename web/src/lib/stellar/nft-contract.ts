import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from './config';

export interface Collection {
  owner: string;
  name: string;
  symbol: string;
  base_uri: string | null;
}

export interface Token {
  owner: string;
  uri: string;
}

export interface MintResult {
  transaction: StellarSdk.Transaction;
  expectedTokenId: number;
  expectedUri: string;
}

export class NFTContract {
  private server: StellarSdk.rpc.Server;
  private contract: StellarSdk.Contract;

  constructor() {
    this.server = new StellarSdk.rpc.Server(STELLAR_CONFIG.RPC_URL);
    this.contract = new StellarSdk.Contract(STELLAR_CONFIG.CONTRACT_ID);
  }

  async getCollection(collectionId: number): Promise<Collection> {
    const dummyKeypair = StellarSdk.Keypair.random();
    const dummyAccount = new StellarSdk.Account(dummyKeypair.publicKey(), '0');
    
    const tx = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
    })
    .addOperation(
      this.contract.call('get_collection', StellarSdk.nativeToScVal(collectionId, {type: 'u32'}))
    )
    .setTimeout(30)
    .build();
    
    const result = await this.server.simulateTransaction(tx);
    if (StellarSdk.rpc.Api.isSimulationError(result)) {
      throw new Error(`Failed to get collection: ${result.error}`);
    }
    
    if (!result.result) {
      throw new Error('No result returned from simulation');
    }
    
    return StellarSdk.scValToNative(result.result.retval);
  }

  async getTotalTokensInCollection(collectionId: number): Promise<number> {
    const dummyKeypair = StellarSdk.Keypair.random();
    const dummyAccount = new StellarSdk.Account(dummyKeypair.publicKey(), '0');
    
    const tx = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
    })
    .addOperation(
      this.contract.call('total_tokens_in_collection', StellarSdk.nativeToScVal(collectionId, {type: 'u32'}))
    )
    .setTimeout(30)
    .build();
    
    const result = await this.server.simulateTransaction(tx);
    if (StellarSdk.rpc.Api.isSimulationError(result)) {
      throw new Error(`Failed to get token count: ${result.error}`);
    }
    
    if (!result.result) {
      throw new Error('No result returned from simulation');
    }
    
    return StellarSdk.scValToNative(result.result.retval);
  }

  async getTotalCollections(): Promise<number> {
    const dummyKeypair = StellarSdk.Keypair.random();
    const dummyAccount = new StellarSdk.Account(dummyKeypair.publicKey(), '0');
    
    const tx = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
    })
    .addOperation(
      this.contract.call('total_collections')
    )
    .setTimeout(30)
    .build();
    
    const result = await this.server.simulateTransaction(tx);
    if (StellarSdk.rpc.Api.isSimulationError(result)) {
      throw new Error(`Failed to get total collections: ${result.error}`);
    }
    
    if (!result.result) {
      throw new Error('No result returned from simulation');
    }
    
    return StellarSdk.scValToNative(result.result.retval);
  }

  async buildMintTransaction(
    minterPublicKey: string, 
    collectionId: number, 
    recipientAddress: string
  ): Promise<MintResult> {
    // Get collection info and next token ID
    const [collection, currentTokenCount] = await Promise.all([
      this.getCollection(collectionId),
      this.getTotalTokensInCollection(collectionId)
    ]);

    const nextTokenId = currentTokenCount;
    const expectedUri = collection.base_uri ? `${collection.base_uri}${nextTokenId}` : '';

    // Get minter account
    const account = await this.server.getAccount(minterPublicKey);
    
    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
    })
    .addOperation(
      this.contract.call(
        'mint_nft',
        StellarSdk.nativeToScVal(minterPublicKey, {type: 'address'}),
        StellarSdk.nativeToScVal(collectionId, {type: 'u32'}),
        StellarSdk.nativeToScVal(recipientAddress, {type: 'address'})
      )
    )
    .setTimeout(30)
    .build();

    return {
      transaction,
      expectedTokenId: nextTokenId,
      expectedUri
    };
  }

  async buildCreateCollectionTransaction(
    creatorPublicKey: string,
    name: string,
    symbol: string,
    baseUri?: string
  ): Promise<{ transaction: StellarSdk.Transaction; expectedCollectionId: number }> {
    const [account, totalCollections] = await Promise.all([
      this.server.getAccount(creatorPublicKey),
      this.getTotalCollections()
    ]);

    const expectedCollectionId = totalCollections;
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
    })
    .addOperation(
      this.contract.call(
        'create_collection',
        StellarSdk.nativeToScVal(creatorPublicKey, {type: 'address'}),
        StellarSdk.nativeToScVal(name, {type: 'string'}),
        StellarSdk.nativeToScVal(symbol, {type: 'string'}),
        StellarSdk.nativeToScVal(baseUri || null, {type: 'option'})
      )
    )
    .setTimeout(30)
    .build();

    return {
      transaction,
      expectedCollectionId
    };
  }

  async getToken(collectionId: number, tokenId: number): Promise<Token> {
    const dummyKeypair = StellarSdk.Keypair.random();
    const dummyAccount = new StellarSdk.Account(dummyKeypair.publicKey(), '0');
    
    const tx = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE,
    })
    .addOperation(
      this.contract.call(
        'get_token', 
        StellarSdk.nativeToScVal(collectionId, {type: 'u32'}), 
        StellarSdk.nativeToScVal(tokenId, {type: 'u32'})
      )
    )
    .setTimeout(30)
    .build();
    
    const result = await this.server.simulateTransaction(tx);
    if (StellarSdk.rpc.Api.isSimulationError(result)) {
      throw new Error(`Failed to get token: ${result.error}`);
    }
    
    if (!result.result) {
      throw new Error('No result returned from simulation');
    }
    
    const tokenData = StellarSdk.scValToNative(result.result.retval);
    
    // Get collection to construct full URI
    const collection = await this.getCollection(collectionId);
    const fullUri = collection.base_uri ? `${collection.base_uri}${tokenId}` : tokenData.uri;
    
    return {
      ...tokenData,
      uri: fullUri
    };
  }

  async submitTransaction(signedTransaction: StellarSdk.Transaction): Promise<string> {
    const result = await this.server.sendTransaction(signedTransaction);
    
    if (result.status === 'ERROR') {
      throw new Error(`Transaction failed: ${JSON.stringify(result)}`);
    }

    // Wait for confirmation
    let getResponse = await this.server.getTransaction(result.hash);
    while (getResponse.status === StellarSdk.rpc.Api.GetTransactionStatus.NOT_FOUND) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      getResponse = await this.server.getTransaction(result.hash);
    }

    if (getResponse.status !== StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS) {
      throw new Error(`Transaction failed: ${JSON.stringify(getResponse)}`);
    }

    return result.hash;
  }
}