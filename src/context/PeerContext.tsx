import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { notification, Button } from 'antd';

import { ChatDraggable } from '../components';

export type Peer = {
  id: string;
};

type PeerContextProps = {
  peers: Peer[];
  sendTransaction: (amount: number, receiver: string) => void;
  mine: () => void;
  addSignalFunc: (id: string, func: Function) => void;
  sendSignal: (id: string, signal: string) => void;
  connect: (id: string) => void;
  draggables: React.ReactElement[];
};

export const PeerContext = React.createContext<PeerContextProps>({
  peers: [],
  sendTransaction: (amount: number, receiver: string) => {},
  mine: () => {},
  addSignalFunc: (id: string, func: Function) => {},
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
  const socket = useRef<Socket | undefined>(undefined);
  const [draggables, setDraggables] = useState<React.ReactElement[]>([]);
  const signalFunctions = useRef<{ [id: string]: Function }>({});

  console.log(draggables);

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

    socket.current.on(
      'rtc',
      ({ id, signal }: { id: string; signal: string }) => {
        if (!signalFunctions.current[id])
          notification.open({
            message: 'A new connection',
            description: `${id} wants to connect with you`,
            btn: (
              <Button
                type='primary'
                size='small'
                onClick={() => {
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
                    />
                  ]);
                  notification.close(id);
                }}
              >
                Connect
              </Button>
            ),
            duration: 0,
            key: id
          });
        else signalFunctions.current[id](signal);
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

  const sendSignal = (id: string, signal: string) => {
    socket.current!.emit('rtc', { id, signal });
  };

  return (
    <PeerContext.Provider
      value={{
        peers,
        sendTransaction,
        mine,
        addSignalFunc,
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
