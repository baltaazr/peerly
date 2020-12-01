import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { notification } from 'antd';

export type Peer = {
  id: string;
};

type PeerContextProps = {
  peers: Peer[];
  sendTransaction: (amount: number, receiver: string) => void;
  mine: () => void;
};

export const PeerContext = React.createContext<PeerContextProps>({
  peers: [],
  sendTransaction: (amount: number, receiver: string) => {},
  mine: () => {}
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
      setPeers((prevPeers) => {
        const result = prevPeers.find(({ id }) => id === data.id);
        if (result !== undefined) return prevPeers;
        else return [...prevPeers, data];
      });
    });

    socket.current.on('peer:disconnect', (data: string) => {
      setPeers((prevPeers) => prevPeers.filter(({ id }) => id !== data));
    });

    socket.current.on('notification', (message: string) => {
      notification.open({
        message
      });
    });
  }, []);

  const sendTransaction = (amount: number, receiver: string) => {
    socket.current!.emit('transaction', { amount, receiver });
  };

  const mine = () => {
    socket.current!.emit('mine');
  };

  return (
    <PeerContext.Provider value={{ peers, sendTransaction, mine }}>
      {children}
    </PeerContext.Provider>
  );
};

export { PeerContextProvider };
