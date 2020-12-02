import { PeerContext } from '../context';

import { useEffect, useRef, useContext, useState } from 'react';
import Peer from 'simple-peer';

const useWebRTC = (
  id: string,
  initiator: boolean,
  close: Function,
  initialSignal?: string
) => {
  const [connected, setConnected] = useState<boolean>(false);
  const [peerVideo, setPeerVideo] = useState<boolean>(false);
  const peer = useRef<Peer.Instance>();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [messages, setMessages] = useState<
    {
      sender: Boolean;
      content: string;
    }[]
  >([]);

  const { addSignalFunc, removeSignalFunc, sendSignal } = useContext(
    PeerContext
  );

  useEffect(() => {
    peer.current = buildPeer();
    addSignalFunc(id, (signal: string) => {
      peer.current!.signal(JSON.parse(signal));
    });

    return () => {
      peer.current!.destroy();
      removeSignalFunc(id);
    };
  }, []);

  const buildPeer = () => {
    let config: object = {
      initiator: true,
      trickle: false,
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

    newPeer.on('signal', (signal: object) => {
      sendSignal(id, JSON.stringify(signal));
    });

    newPeer.on('stream', (stream) => {
      if (!peerVideo) setPeerVideo(true);
      if (videoRef.current) videoRef.current!.srcObject = stream;
    });

    newPeer.on('connect', () => {
      setConnected(true);
    });

    newPeer.on('data', (message: Uint8Array) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: false, content: new TextDecoder('utf-8').decode(message) }
      ]);
    });

    newPeer.on('error', (err: any) => {
      console.error(err.code);
    });

    if (initialSignal) newPeer.signal(JSON.parse(initialSignal));

    newPeer.on('close', () => {
      close();
    });

    return newPeer;
  };

  const sendMessage = (message: string) => {
    peer.current!.send(message);
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: true, content: message }
    ]);
  };

  const addVideo = (stream: MediaStream) => {
    peer.current!.addStream(stream);
  };

  return { connected, messages, sendMessage, addVideo, videoRef, peerVideo };
};

export { useWebRTC };
