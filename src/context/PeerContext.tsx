import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export type Peer = {
  id: string;
};

type PeerContextProps = {
  peers: Peer[];
  sendTransaction: (amount: number, receiver: string) => void;
};

export const PeerContext = React.createContext<PeerContextProps>({
  peers: [],
  sendTransaction: (amount: number, receiver: string) => {}
});

const PeerContextProvider = ({
  children
}: {
  children: React.ReactNode | React.ReactNode[];
}) => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const socket = useRef<Socket | undefined>(undefined);

  useEffect(() => {
    socket.current = io('http://localhost:5000', {
      transports: ['websocket']
    });

    socket.current.on('peers', (data: Peer[]) => {
      setPeers(data);
    });

    socket.current.on('peer:connect', (data: Peer) => {
      setPeers((prevPeers) => [...prevPeers, data]);
    });

    socket.current.on('peer:disconnect', (data: string) => {
      setPeers((prevPeers) => prevPeers.filter(({ id }) => id !== data));
    });
  }, []);

  const sendTransaction = (amount: number, receiver: string) => {
    socket.current!.emit('transaction', { amount, receiver });
  };

  return (
    <PeerContext.Provider value={{ peers, sendTransaction }}>
      {children}
    </PeerContext.Provider>
  );
};

export { PeerContextProvider };
