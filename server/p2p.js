const TCP = require('libp2p-tcp');
const Websockets = require('libp2p-websockets');
const WebRTCStar = require('libp2p-webrtc-star');

const wrtc = require('wrtc');

const multiaddr = require('multiaddr');

const Mplex = require('libp2p-mplex');

const { NOISE } = require('libp2p-noise');

const Libp2p = require('libp2p');

const main = async () => {
  const libp2p = await Libp2p.create({
    addresses: {
      listen: [
        '/ip4/0.0.0.0/tcp/0',
        '/ip4/0.0.0.0/tcp/0/ws',
        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
      ]
    },
    modules: {
      transport: [TCP, Websockets, WebRTCStar],
      streamMuxe: [Mplex],
      connEncryption: [NOISE]
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
