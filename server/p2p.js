const TCP = require('libp2p-tcp');
const Websockets = require('libp2p-websockets');
const WebRTCStar = require('libp2p-webrtc-star');
const process = require('process');
const PeerId = require('peer-id');
const fs = require('fs');
const generateKey = require('./generate_key');

const wrtc = require('wrtc');

const multiaddr = require('multiaddr');

const Mplex = require('libp2p-mplex');

const { NOISE } = require('libp2p-noise');

const SignalProtocol = require('./signal-protocol');

const Libp2p = require('libp2p');

const main = async () => {
  if (!fs.existsSync('./peer-id.json')) {
    await generateKey();
  }

  const id = await PeerId.createFromJSON(require('../peer-id.json'));

  const libp2p = await Libp2p.create({
    peerId: id,
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

  libp2p.connectionManager.on('peer:connect', (connection) => {
    console.info(`Connected to ${connection.remotePeer.toB58String()}`);
  });

  libp2p.handle(SignalProtocol.PROTOCOL, SignalProtocol.handler);

  await libp2p.start();

  console.info(`${libp2p.peerId.toB58String()} listening on addresses:`);
  console.info(
    libp2p.multiaddrs.map((addr) => addr.toString()).join('\n'),
    '\n'
  );

  process.stdin.on('data', (message) => {
    message = message.slice(0, -1);
    libp2p.peerStore.peers.forEach(async (peerData) => {
      if (!peerData.protocols.includes(SignalProtocol.PROTOCOL)) return;

      const connection = libp2p.connectionManager.get(peerData.id);
      if (!connection) return;

      try {
        const { stream } = await connection.newStream([
          SignalProtocol.PROTOCOL
        ]);
        await SignalProtocol.send(message, stream);
      } catch (err) {
        console.error(
          'Could not negotiate chat protocol stream with peer',
          err
        );
      }
    });
  });

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
