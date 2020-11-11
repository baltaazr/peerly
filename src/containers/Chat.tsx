import React from 'react';
import { useWebRTC } from '../hooks';

export const Chat = () => {
  const libp2p = useWebRTC();

  return <div>Chat</div>;
};
