import * as bitcoin from 'bitcoinjs-lib';
import b58 from 'bs58check';
import btc from '../blockchain/btc';

const generateAddress = (index: number, xpub: string): string => {
  let pubKey = xpub;

  const network = btc.network
    ? bitcoin.networks.bitcoin
    : bitcoin.networks.testnet;

  if (network === bitcoin.networks.testnet) {
    let data = b58.decode(pubKey);
    data = data.slice(4);
    data = Buffer.concat([Buffer.from('043587cf', 'hex'), data]);
    pubKey = b58.encode(data);
  }

  const p2wpkh = bitcoin.payments.p2wpkh({
    pubkey: bitcoin.bip32
      .fromBase58(pubKey, network)
      .derive(0)
      .derive(index).publicKey,
    network,
  });
  const payment = bitcoin.payments.p2sh({ redeem: p2wpkh, network });

  if (!payment.address) throw new Error('fail generating address');

  return payment.address;
};

export default function(index: number, xpub: string): string {
  return generateAddress(index, xpub);
}
