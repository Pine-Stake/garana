import { 
  isConnected, 
  isAllowed, 
  setAllowed, 
  signTransaction 
} from '@stellar/freighter-api';
import freighterApi from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from './config';

export interface UserInfo {
  publicKey: string;
}

export class FreighterWallet {
  async isAvailable(): Promise<boolean> {
    try {
      const result = await isConnected();
      return result.isConnected;
    } catch (error) {
      console.error('Error checking Freighter availability:', error);
      return false;
    }
  }

  async connect(): Promise<UserInfo> {
    try {
      const allowedResult = await isAllowed();
      if (allowedResult.isAllowed) {
        const addressResult = await freighterApi.getAddress();
        return { publicKey: addressResult.address };
      }
      
      await setAllowed();
      const addressResult = await freighterApi.getAddress();
      return { publicKey: addressResult.address };
    } catch (error) {
      console.error('Error connecting to Freighter:', error);
      throw new Error('Failed to connect to Freighter wallet. Please make sure it is installed and unlocked.');
    }
  }

  async signTransaction(transaction: StellarSdk.Transaction): Promise<StellarSdk.Transaction> {
    try {
      const signedResult = await signTransaction(transaction.toXDR(), {
        networkPassphrase: STELLAR_CONFIG.NETWORK_PASSPHRASE
      });
      
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedResult.signedTxXdr,
        STELLAR_CONFIG.NETWORK_PASSPHRASE
      );

      // Ensure we return a Transaction, not a FeeBumpTransaction
      if (signedTx instanceof StellarSdk.Transaction) {
        return signedTx;
      } else {
        throw new Error('Unexpected transaction type returned');
      }
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw new Error('Failed to sign transaction. Please try again.');
    }
  }

  async getUserInfo(): Promise<UserInfo> {
    try {
      const addressResult = await freighterApi.getAddress();
      return { publicKey: addressResult.address };
    } catch (error) {
      console.error('Error getting user info:', error);
      throw new Error('Failed to get user information from Freighter.');
    }
  }
}