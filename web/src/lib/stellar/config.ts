export const STELLAR_CONFIG = {
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org',
  NETWORK_PASSPHRASE: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
  CONTRACT_ID: process.env.NEXT_PUBLIC_CONTRACT_ID || 'CBQOMU3JVKPFKN5SVP7XN6OEURNKF2NBP76UCNWT3IPBSNUIQ6VPJX4Q',
};

export const STELLAR_EXPLORER_URL = 'https://stellar.expert/explorer/testnet';