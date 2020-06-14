import * as zmq from 'zeromq';
import Client from 'bitcoin-core';

const network = !!(process.env.MAINNET && process.env.MAINNET !== 'false');
const socketTransaction = new zmq.Subscriber();
const socketBlock = new zmq.Subscriber();
socketTransaction.connect(process.env.ZMQ_ADDRESS || 'tcp://127.0.0.1:28332');
socketBlock.connect(process.env.ZMQ_ADDRESS || 'tcp://127.0.0.1:28332');
socketTransaction.subscribe('rawtx');
socketBlock.subscribe('hashblock');

const rpc = new Client({
  host: process.env.RPC_HOST || 'localhost',
  port: process.env.RPC_PORT || '18332',
  username: process.env.RPC_USER || 'bitcoin',
  password: process.env.RPC_PASS || 'local321',
  network: network ? 'mainnet' : 'testnet',
});

export default {
  socket: { tx: socketTransaction, block: socketBlock },
  rpc,
  network,
};
