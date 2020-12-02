import React, { useContext, useState } from 'react';
import { Typography, List, Modal, Button, Form, InputNumber } from 'antd';
import styled from 'styled-components';

import { ChatDraggable } from '../components';
import { PeerContext } from '../context';

const StyledListItem = styled(List.Item)`
  cursor: pointer;
`;

export const Main = () => {
  const [modal, setModal] = useState<
    { id: string; type: 'main' | 'transaction' } | undefined
  >(undefined);
  const { peers, sendTransaction, mine, connect, draggables } = useContext(
    PeerContext
  );

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
        <Typography>Number of peers connected: {peers.length}</Typography>
        <List
          itemLayout='horizontal'
          bordered
          dataSource={peers}
          renderItem={(peer) => (
            <StyledListItem
              onClick={() => {
                connect(peer.id);
              }}
            >
              <List.Item.Meta title={peer.id} />
            </StyledListItem>
          )}
        />
        <Modal
          title={(modal && modal.id) || ''}
          visible={modal && modal.type === 'transaction'}
          footer={[]}
          onCancel={() => {
            setModal(undefined);
          }}
        >
          <Form
            name='transaction'
            onFinish={({ amount }) => {
              sendTransaction(amount, modal!.id);
              setModal(undefined);
            }}
          >
            <Form.Item
              label='Amount'
              name='amount'
              rules={[
                () => ({
                  required: true,
                  validator(_, value) {
                    if (value && value > 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      'Please enter an amount greater than zero!'
                    );
                  }
                })
              ]}
            >
              <InputNumber />
            </Form.Item>
            <Form.Item>
              <Button type='primary' htmlType='submit'>
                Send
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
      {draggables}
    </>
  );
};
