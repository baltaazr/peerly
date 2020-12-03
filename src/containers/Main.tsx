import React, { useContext } from 'react';
import { Typography, List, Button, notification } from 'antd';
import styled from 'styled-components';

import { PeerContext } from '../context';

const StyledListItem = styled(List.Item)`
  cursor: pointer;
`;

const { Title } = Typography;

export const Main = () => {
  const { peers, wallet, mine, connect, draggables } = useContext(PeerContext);

  return (
    <>
      <div style={{ width: 500, marginLeft: 'auto', marginRight: 'auto' }}>
        <Button
          style={{ position: 'absolute', top: 10, left: 10 }}
          onClick={mine}
          type='primary'
        >
          Mine
        </Button>
        <Title style={{ marginTop: 10 }} level={5}>
          Wallet: {wallet} VectorCoins
        </Title>
        <Title level={5}>Number of peers connected: {peers.length}</Title>
        <List
          itemLayout='horizontal'
          bordered
          dataSource={peers}
          renderItem={(peer) => (
            <StyledListItem
              onClick={() => {
                if (draggables.find(({ props }) => props.id === peer.id))
                  notification.open({
                    message: "You're already connected to this peer",
                    description: 'Try a different one'
                  });
                else connect(peer.id);
              }}
            >
              <List.Item.Meta title={peer.id} />
            </StyledListItem>
          )}
        />
      </div>
      {draggables}
    </>
  );
};
