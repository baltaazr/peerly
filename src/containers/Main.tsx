import React, { useContext } from 'react';
import { Typography } from 'antd';

import { PeerContext } from '../context';

export const Main = () => {
  const { peers } = useContext(PeerContext);

  return (
    <div>
      <Typography>Number of peers connected: {peers.length}</Typography>
    </div>
  );
};
