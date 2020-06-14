import { isDocumentArray } from '@typegoose/typegoose';
import addresses from '../blockchain/addresses';
import WalletModel from '../models/Wallet';
import db from '../db';

export default async function(): Promise<void> {
  db.connect();
  const wallets = await WalletModel.find().populate('accounts');
  console.log(`Loading address to memory ...`);
  // prevent recreation of address to increase performance
  wallets.forEach(wallet => {
    if (isDocumentArray(wallet.accounts)) {
      wallet.accounts.forEach(account => {
        addresses.add(account.address);
      });
    }
  });

  console.log(`${addresses.size} addresses loaded to the memory`);

  // route();
}
