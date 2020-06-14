import { isDocument } from '@typegoose/typegoose';
import * as bitcoin from 'bitcoinjs-lib';
import Account from '../models/Account';
import TransactionModel from '../models/Transaction';
import addresses from './addresses';
import btc from './btc';

export default async function(): Promise<void> {
  console.log('Listening to transaction on the blockchain...');

  // eslint-disable-next-line no-restricted-syntax
  for await (const [topic, message] of btc.socket.tx) {
    if (topic.toString() !== 'rawtx') return;
    const trx = bitcoin.Transaction.fromBuffer(message);

    if (trx.outs.length) {
      // use any type definition not released to stable

      const promises = trx.outs.map(async output => {
        let address: string;
        try {
          // obtain address from P2PKH and P2SH
          address = bitcoin.address.fromOutputScript(
            output.script,
            btc.network ? bitcoin.networks.bitcoin : bitcoin.networks.testnet,
          );
        } catch (e) {
          return;
        }

        if (
          address &&
          !addresses.has(address.toLowerCase()) &&
          !addresses.has(address)
        )
          return;

        try {
          TransactionModel.findOneAndUpdate(
            { hash: trx.getId() },
            {
              to: address.toLowerCase(),
              hash: trx.getId(),
              value: output.value,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },
            async (_err, transaction) => {
              if (_err) throw new Error(_err);
              const account = await Account.findOne({
                address: {
                  $in: [address, transaction.to],
                },
              }).populate('wallet');

              if (account && isDocument(account.wallet)) {
                transaction.wallet = account.wallet.id;
                await transaction.save();
              }

              console.log(`Found incoming transaction to ${address}`);
              console.log(`Transaction value is: ${output.value}`);
              console.log(`Transaction hash is: ${trx.getId()}`);
            },
          );
        } catch (error) {
          console.log(error);
        }
      });

      await Promise.all(promises);
    }
  }
}
