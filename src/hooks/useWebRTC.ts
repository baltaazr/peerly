import { PeerContext } from '../context';

import { useEffect, useRef, useContext, useState } from 'react';
import Peer from 'simple-peer';

const useWebRTC = (id: string, initiator: boolean, initialSignal?: string) => {
  const peer = useRef<Peer.Instance>();
  const connected = useRef<boolean>();
  const disconnect = useRef<boolean>();

  const [messages, setMessages] = useState<
    {
      sender: Boolean;
      content: string;
    }[]
  >([]);

  const { addSignalFunc, sendSignal } = useContext(PeerContext);

  useEffect(() => {
    peer.current = buildPeer();
    addSignalFunc(id, (signal: string) => {
      peer.current!.signal(signal);
    });

    return () => {
      disconnect.current = true;
      if (peer.current) peer.current.destroy();
    };
  }, []);

  const buildPeer = () => {
    let config: object = {
      initiator: true,
      config: {
        iceServers: [
          {
            urls: 'stun:stun.remotenc.com:5349'
          },
          {
            urls: 'turn:turn.remotenc.com:5349',
            username: 'user',
            credential: '12345678'
          }
        ]
      }
    };
    if (!initiator) config = { initiator: false };

    const newPeer = new Peer(config);

    newPeer.on('signal', (signal: string) => {
      sendSignal(id, signal);
    });

    newPeer.on('data', (message: string) => {
      connected.current = true;
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: false, content: message }
      ]);
    });

    newPeer.on('error', (err: any) => {
      console.error(err.code);
    });

    if (initialSignal) newPeer.signal(initialSignal);

    // newPeer.on('close', () => {
    //   if (disconnect.current) return;
    //   socket.current!.off('rtc');
    //   peer.current = buildPeer();
    //   socket.current!.on('rtc', (signal: string) => {
    //     if (peer.current) peer.current.signal(signal);
    //   });
    // });

    return newPeer;
  };

  const sendMessage = (message: string) => {
    peer.current!.send(message);
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: true, content: message }
    ]);
  };

  return { connected, messages, sendMessage };
};

export { useWebRTC };
