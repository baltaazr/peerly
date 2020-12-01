const TCP = require('libp2p-tcp');
const Websockets = require('libp2p-websockets');
const WebRTCStar = require('libp2p-webrtc-star');
const PeerId = require('peer-id');
const fs = require('fs');
const wrtc = require('wrtc');
const multiaddr = require('multiaddr');
const Mplex = require('libp2p-mplex');
const { NOISE } = require('libp2p-noise');
const Libp2p = require('libp2p');
const sio = require('socket.io');
const { Worker } = require('worker_threads');
const chalk = require('chalk');

const generateKey = require('./generate_key');
const SignalProtocol = require('./signal-protocol');
const CryptocurrencyProtocol = require('./cryptocurrency-protocol');
const Transaction = require('./Blockchain/Transaction');
const read_blockchain = require('./Blockchain/read_blockchain');

const log = console.log;
const error = console.error;
const info = console.info;

const main = async (server) => {
  if (!fs.existsSync('./peer-id.json')) {
    await generateKey();
  }

  const peerId = await PeerId.createFromJSON(require('../peer-id.json'));

  // Create our libp2p node
  const libp2p = await Libp2p.create({
    peerId,
    // Add the signaling server address, along with our PeerId to our multiaddrs list
    // libp2p will automatically attempt to dial to the signaling server so that it can
    // receive inbound connections from other peers
    addresses: {
      listen: [
        '/ip4/0.0.0.0/tcp/0',
        '/ip4/0.0.0.0/tcp/0/ws',
        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
      ]
    },
    modules: {
      transport: [TCP, Websockets, WebRTCStar],
      streamMuxer: [Mplex],
      connEncryption: [NOISE],
      peerDiscover: []
    },
    config: {
      transport: {
        [WebRTCStar.prototype[Symbol.toStringTag]]: {
          wrtc
        }
      }
    }
  });

  let worker;

  const handler = (arg) => {
    const protocol = arg.protocol;

    switch (protocol) {
      case SignalProtocol.PROTOCOL:
        SignalProtocol.handler(arg);
        break;
      case CryptocurrencyProtocol.ledger.PROTOCOL:
        CryptocurrencyProtocol.ledger.handler(arg);
        if (worker) worker.terminate();
        break;
      case CryptocurrencyProtocol.transaction.PROTOCOL:
        CryptocurrencyProtocol.transaction.handler(arg);
        break;
      default:
        error('Protocol not supported');
        break;
    }
  };

  libp2p.handle(
    [
      SignalProtocol.PROTOCOL,
      CryptocurrencyProtocol.ledger.PROTOCOL,
      CryptocurrencyProtocol.transaction.PROTOCOL
    ],
    handler
  );

  const io = sio(server);

  const checkPeer = ({ protocols, id }, connected = true) => {
    // if (!protocols) return false;
    // if (
    //   !protocols.includes(CryptocurrencyProtocol.transaction.PROTOCOL) ||
    //   !protocols.includes(CryptocurrencyProtocol.ledger.PROTOCOL) ||
    //   !protocols.includes(SignalProtocol.PROTOCOL)
    // )
    //   return false;

    if (connected) {
      const connection = libp2p.connectionManager.get(id);
      if (!connection) return;
    }

    return true;
  };

  // Listen for new connections to peers
  libp2p.connectionManager.on('peer:connect', (connection) => {
    if (!checkPeer(connection.remotePeer, false)) return;

    const id = connection.remotePeer.toB58String();
    log(chalk.green(`🔌  Connected to ${chalk.white(id)}`));
    io.sockets.emit('peer:connect', connection.remotePeer.toJSON());
  });

  // Listen for peers disconnecting
  libp2p.connectionManager.on('peer:disconnect', (connection) => {
    const id = connection.remotePeer.toB58String();
    log(chalk.red(`❌  Disconnected from ${chalk.white(id)}`));
    io.sockets.emit('peer:disconnect', id);
  });

  io.on('connection', (socket) => {
    const peers = [];

    libp2p.peerStore.peers.forEach((peerData) => {
      if (!checkPeer(peerData)) return;

      peers.push(peerData.id);
    });

    socket.emit('peers', peers);

    socket.on('transaction', ({ receiver, amount }) => {
      const sender = peerId.toJSON();
      delete sender.privKey;
      const transaction = new Transaction(sender, receiver, amount);
      transaction.sign(peerId.privKey._key);

      libp2p.peerStore.peers.forEach(async (peerData) => {
        if (!checkPeer(peerData)) return;

        const connection = libp2p.connectionManager.get(peerData.id);

        try {
          const { stream } = await connection.newStream([
            CryptocurrencyProtocol.transaction.PROTOCOL
          ]);
          await CryptocurrencyProtocol.transaction.send(
            transaction.json,
            stream
          );
        } catch (err) {
          error('Could not negotiate chat protocol stream with peer', err);
        }
      });
    });

    socket.on('mine', () => {
      const transactions = read_blockchain().unconfirmed_transactions;
      if (transactions.length === 0) {
        socket.emit('notification', 'No transactions to mine');
        return;
      }
      worker = new Worker('./server/Blockchain/mine.js');
      worker.on('close', () => {
        const blockchain = read_blockchain();
        libp2p.peerStore.peers.forEach(async (peerData) => {
          if (!checkPeer(peerData)) return;

          const connection = libp2p.connectionManager.get(peerData.id);

          try {
            const { stream } = await connection.newStream([
              CryptocurrencyProtocol.ledger.PROTOCOL
            ]);
            await CryptocurrencyProtocol.ledger.send(blockchain.json, stream);
          } catch (err) {
            error('Could not negotiate chat protocol stream with peer', err);
          }
        });
      });
    });
  });

  await libp2p.start();

  info(`${libp2p.peerId.toB58String()} listening on addresses:`);
  info(libp2p.multiaddrs.map((addr) => addr.toString()).join('\n'), '\n');

  const targetAddress = multiaddr(
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN'
  );

  try {
    await libp2p.dial(targetAddress);
  } catch (err) {
    error(err);
  }
};

module.exports = main;
