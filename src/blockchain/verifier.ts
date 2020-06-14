import { isDocument } from '@typegoose/typegoose';
import satobit from 'satoshi-bitcoin';
import TransactionModel from '../models/Transaction';
import queue from '../utils/queue';
import btc from './btc';

const confirmTransaction = async (): Promise<void> => {
  const transactions = await TransactionModel.find({
    confirmed: false,
  }).populate('wallet');

  if (!transactions.length) return;

  console.log(`[Tx Verify] Verifying ${transactions.length} transaction`);
  const promises = transactions.map(async transaction => {
    try {
      const trx = await btc.rpc.getRawTransaction(transaction.hash, true);

      if (!trx || typeof trx === 'string') return;

      const block = await btc.rpc.getBlock(trx.blockhash, 1);

      if (!block || typeof block === 'string') return;

      if (transaction.blockHash === null) {
        transaction.blockHash = block.hash;
      }

      if (transaction.blockNumber === null) {
        transaction.blockNumber = block.height;
      }

      console.log(
        `Transaction with hash ${transaction.hash} has ${trx.confirmations} confirmation(s)`,
      );

      if (trx.confirmations > 0) {
        console.log(
          `Transaction with hash ${transaction.hash} has been successfully confirmed`,
        );
        transaction.confirmed = true;
      }

      transaction.confimations = trx.confirmations;

      await transaction.save();

      // Broadcast the event

      if (isDocument(transaction.wallet)) {
        const broadcast = queue(
          `btcwallet:confirmedTransactions:${transaction.wallet.apiKey}`,
        );
        broadcast.add({
          address: transaction.to,
          value: satobit.toBitcoin(transaction.value),
        });
      }
    } catch (e) {
      console.log(e);
    }
  });
  // TODO
  // We should give up if transaction is failing

  await Promise.all(promises);
};

export default async function(): Promise<void> {
  // eslint-disable-next-line no-restricted-syntax
  for await (const [topic] of btc.socket.block) {
    // we detect on new block
    confirmTransaction();
  }
}
