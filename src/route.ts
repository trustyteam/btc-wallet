import { Router } from 'express';
import { randomBytes } from 'crypto';
import verify from './middleware/verify';
import WalletModel from './models/Wallet';
import address from './utils/address';
import AccountModel from './models/Account';
import addresses from './blockchain/addresses';

const router = Router();

router.post('/wallets', async (req, res) => {
  try {
    const { xpub } = req.body;

    const wallet = await WalletModel.findOne({ publicKey: xpub.trim() });
    if (!xpub || wallet) return res.status(500).end();

    const buffer = randomBytes(48);
    const apiKey = buffer.toString('hex');
    const newWallet = await WalletModel.create({ publicKey: xpub, apiKey });

    return res.json({ apiKey: newWallet.apiKey });
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
});

router.post('/addresses', verify, async (req, res) => {
  try {
    const wallet = res.locals.user;

    if (wallet === null) return;

    const currentIndex = wallet.hdIndex;
    const newAddress = address(currentIndex, wallet.publicKey);
    const newAccount = await AccountModel.create({
      address: newAddress,
      hdIndex: currentIndex,
      wallet: wallet.id,
    });
    await wallet.updateOne({ $inc: { hdIndex: 1 } });
    wallet.accounts.push(newAccount);
    await wallet.save();
    addresses.add(newAddress);
    console.log(`${addresses.size} addresses loaded to the memory`);

    res.json({ address: newAddress, hdIndex: currentIndex });
  } catch (error) {
    console.log(error);
    res.status(401).end();
  }
});

export default router;
