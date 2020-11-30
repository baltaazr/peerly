const TCP = require('libp2p-tcp');
const Websockets = require('libp2p-websockets');
const WebRTCStar = require('libp2p-webrtc-star');
const PeerId = require('peer-id');
const fs = require('fs');
const generateKey = require('./generate_key');
const wrtc = require('wrtc');
const multiaddr = require('multiaddr');
const Mplex = require('libp2p-mplex');
const { NOISE } = require('libp2p-noise');
const SignalProtocol = require('./signal-protocol');
const CryptocurrencyProtocol = require('./cryptocurrency-protocol');
const Libp2p = require('libp2p');
const sio = require('socket.io');
const Transaction = require('./Blockchain/Transaction');
const chalk = require('chalk');
const log = console.log;

const main = async (server) => {
  if (!fs.existsSync('./peer-id.json')) {
    await generateKey();
  }

  const peerId = await PeerId.createFromJSON(require('../peer-id.json'));

  const libp2p = await Libp2p.create({
    peerId,
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

  const handler = (arg) => {
    const protocol = arg.protocol;

    switch (protocol) {
      case SignalProtocol.PROTOCOL:
        SignalProtocol.handler(arg);
        break;
      case CryptocurrencyProtocol.ledger.PROTOCOL:
        CryptocurrencyProtocol.ledger.handler(arg);
        break;
      case CryptocurrencyProtocol.transaction.PROTOCOL:
        CryptocurrencyProtocol.transaction.handler(arg);
        break;
      default:
        console.error('Protocol not supported');
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

  const checkPeer = ({ protocols }) => {
    // if (!protocols) return false;
    // if (
    //   !protocols.includes(CryptocurrencyProtocol.transaction.PROTOCOL) ||
    //   !protocols.includes(CryptocurrencyProtocol.ledger.PROTOCOL) ||
    //   !protocols.includes(SignalProtocol.PROTOCOL)
    // )
    //   return false;
    return true;
  };

  libp2p.connectionManager.on('peer:connect', (connection) => {
    if (!checkPeer(connection.remotePeer)) return;

    const id = connection.remotePeer.toB58String();
    log(chalk.green(`Connected to ${id}`));
    io.sockets.emit('peer', connection.remotePeer.toJSON());
  });

  io.on('connection', (socket) => {
    log(chalk.blue('Socket connected'));

    const peers = [];

    libp2p.peerStore.peers.forEach((peerData) => {
      if (checkPeer(peerData)) peers.push(peerData);
    });

    socket.emit('peers', peers);

    socket.on('transaction', ({ receiver, amount }) => {
      const sender = peerId.toJSON();
      const privKey = sender.privKey;
      delete sender.privKey;
      const transaction = new Transaction(sender, receiver, amount);
      transaction.sign(privKey);

      libp2p.peerStore.peers.forEach(async (peerData) => {
        if (!checkPeer(peerData)) return;

        const connection = libp2p.connectionManager.get(peerData.id);
        if (!connection) return;

        try {
          const { stream } = await connection.newStream([
            CryptocurrencyProtocol.transaction.PROTOCOL
          ]);
          await SignalProtocol.send(transaction.json, stream);
        } catch (err) {
          console.error(
            'Could not negotiate chat protocol stream with peer',
            err
          );
        }
      });
    });

    socket.on('mine', () => {
      // Begin mining using multithreading
    });
  });

  await libp2p.start();

  console.info(`${libp2p.peerId.toB58String()} listening on addresses:`);
  console.info(
    libp2p.multiaddrs.map((addr) => addr.toString()).join('\n'),
    '\n'
  );

  const targetAddress = multiaddr(
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN'
  );

  try {
    await libp2p.dial(targetAddress);
  } catch (err) {
    console.error(err);
  }
};

module.exports = main;
