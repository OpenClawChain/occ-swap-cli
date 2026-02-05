import { connect, keyStores, KeyPair } from 'near-api-js';

export interface TransactionData {
  receiverId: string;
  actions: Array<{
    type: string;
    params: {
      methodName: string;
      args: Record<string, any>;
      gas: string;
      deposit: string;
    };
  }>;
}

export async function signAndSendMultipleTransactions(
  accountId: string,
  privateKey: string,
  transactions: TransactionData[],
  networkId: string = 'mainnet',
  rpcUrl: string = 'https://rpc.mainnet.near.org'
): Promise<string[]> {
  // Setup key store with private key
  const keyStore = new keyStores.InMemoryKeyStore();
  const keyPair = KeyPair.fromString(privateKey as any);
  await keyStore.setKey(networkId, accountId, keyPair);

  // Connect to NEAR
  const nearConnection = await connect({
    networkId,
    keyStore,
    nodeUrl: rpcUrl,
  });

  // Get account
  const account = await nearConnection.account(accountId);

  const txHashes: string[] = [];

  // Execute transactions sequentially
  for (const tx of transactions) {
    const result = await account.functionCall({
      contractId: tx.receiverId,
      methodName: tx.actions[0].params.methodName,
      args: tx.actions[0].params.args,
      gas: BigInt(tx.actions[0].params.gas),
      attachedDeposit: BigInt(tx.actions[0].params.deposit),
    });
    txHashes.push(result.transaction.hash);
  }

  return txHashes;
}
