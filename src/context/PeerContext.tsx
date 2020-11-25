import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export type Peer = {
  id: string;
};

type PeerContextProps = {
  peers: Peer[];
};

export const PeerContext = React.createContext<PeerContextProps>({
  peers: []
});

const PeerContextProvider = ({
  children
}: {
  children: React.ReactNode | React.ReactNode[];
}) => {
  const [peers, setPeers] = useState<Peer[]>([]);

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket']
    });

    socket.on('peers', (data: Peer[]) => {
      console.log(`setting peers ${data.length}`);
      setPeers(data);
    });

    socket.on('peer', (data: Peer) => {
      console.log(`new peer ${data.id}`);
      setPeers((prevPeers) => [...prevPeers, data]);
    });
  }, []);

  return (
    <PeerContext.Provider value={{ peers: peers }}>
      {children}
    </PeerContext.Provider>
  );
};

export { PeerContextProvider };
