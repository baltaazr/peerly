import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { notification, Button } from 'antd';

import { ChatDraggable } from '../components';

export type Peer = {
  id: string;
};

type PeerContextProps = {
  peers: Peer[];
  wallet: number;
  sendTransaction: (amount: number, receiver: string) => void;
  mine: () => void;
  addSignalFunc: (id: string, func: Function) => void;
  removeSignalFunc: (id: string) => void;
  sendSignal: (id: string, signal: string) => void;
  connect: (id: string) => void;
  draggables: React.ReactElement[];
};

export const PeerContext = React.createContext<PeerContextProps>({
  peers: [],
  wallet: 0,
  sendTransaction: (amount: number, receiver: string) => {},
  mine: () => {},
  addSignalFunc: (id: string, func: Function) => {},
  removeSignalFunc: (id: string) => {},
  sendSignal: (id: string, signal: string) => {},
  connect: (id: string) => {},
  draggables: []
});

const PeerContextProvider = ({
  children
}: {
  children: React.ReactNode | React.ReactNode[];
}) => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [wallet, setWallet] = useState<number>(0);
  const socket = useRef<Socket | undefined>(undefined);
  const [draggables, setDraggables] = useState<React.ReactElement[]>([]);
  const signalFunctions = useRef<{ [id: string]: Function | undefined }>({});

  useEffect(() => {
    socket.current = io('http://localhost:5000', {
      transports: ['websocket']
    });

    socket.current.on('peers', (data: Peer[]) => {
      setPeers(data);
    });

    socket.current.on('wallet', (data: number) => {
      setWallet(data);
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

    socket.current.on(
      'rtc',
      ({ id, signal }: { id: string; signal: string }) => {
        if (!signalFunctions.current[id])
          setDraggables((prevDraggables) => [
            ...prevDraggables,
            <ChatDraggable
              close={() => {
                setDraggables((pD) =>
                  pD.filter(({ props }) => id !== props.id)
                );
              }}
              id={id}
              initiator={false}
              initialSignal={signal}
              key={id}
              sendTransaction={sendTransaction}
              wallet={wallet}
            />
          ]);
        else signalFunctions.current[id]!(signal);
      }
    );

    socket.current.on('notification', (message: string) => {
      notification.open({
        message
      });
    });
  }, []);

  const connect = (id: string) => {
    setDraggables((prevDraggables) => [
      ...prevDraggables,
      <ChatDraggable
        id={id}
        initiator={true}
        close={() => {
          setDraggables((pD) => pD.filter(({ props }) => id !== props.id));
        }}
        key={id}
        sendTransaction={sendTransaction}
        wallet={wallet}
      />
    ]);
  };

  const sendTransaction = (amount: number, receiver: string) => {
    socket.current!.emit('transaction', { amount, receiver });
  };

  const mine = () => {
    socket.current!.emit('mine');
  };

  const addSignalFunc = (id: string, func: Function) => {
    signalFunctions.current![id] = func;
  };

  const removeSignalFunc = (id: string) => {
    signalFunctions.current![id] = undefined;
  };

  const sendSignal = (id: string, signal: string) => {
    socket.current!.emit('rtc', { id, signal });
  };

  return (
    <PeerContext.Provider
      value={{
        peers,
        wallet,
        sendTransaction,
        mine,
        addSignalFunc,
        removeSignalFunc,
        sendSignal,
        connect,
        draggables
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};

export { PeerContextProvider };
