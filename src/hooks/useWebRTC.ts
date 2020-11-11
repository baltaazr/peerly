import { useRef, useEffect } from 'react';
import Libp2p from 'libp2p';
import Websockets from 'libp2p-websockets';
import WebRTCStar from 'libp2p-webrtc-star';
import { NOISE } from 'libp2p-noise';
import Mplex from 'libp2p-mplex';

export const useWebRTC = () => {
  const libp2p = useRef<any>(null);

  const initialize = async () => {
    // Create our libp2p node
    libp2p.current = await Libp2p.create({
      addresses: {
        // Add the signaling server address, along with our PeerId to our multiaddrs list
        // libp2p will automatically attempt to dial to the signaling server so that it can
        // receive inbound connections from other peers
        listen: [
          '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
        ]
      },
      modules: {
        transport: [Websockets, WebRTCStar],
        connEncryption: [NOISE],
        streamMuxer: [Mplex]
      }
    });

    // Listen for new peers
    libp2p.current.on('peer:discovery', (peerId: any) => {
      console.log(`Found peer ${peerId.toB58String()}`);
    });

    // Listen for new connections to peers
    libp2p.current.connectionManager.on('peer:connect', (connection: any) => {
      console.log(`Connected to ${connection.remotePeer.toB58String()}`);
    });

    // Listen for peers disconnecting
    libp2p.current.connectionManager.on(
      'peer:disconnect',
      (connection: any) => {
        console.log(`Disconnected from ${connection.remotePeer.toB58String()}`);
      }
    );

    await libp2p.current.start();
    console.log(`libp2p id is ${libp2p.current.peerId.toB58String()}`);
  };

  useEffect(() => {
    initialize();
  }, []);

  return libp2p;
};
