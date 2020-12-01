import React, { useContext, useState } from 'react';
import { Typography, List, Modal, Button, Form, InputNumber } from 'antd';

import { PeerContext } from '../context';

export const Main = () => {
  const [modal, setModal] = useState<
    { id: string; type: 'main' | 'transaction' } | undefined
  >(undefined);
  const { peers, sendTransaction } = useContext(PeerContext);

  return (
    <div style={{ width: 500, marginLeft: 'auto', marginRight: 'auto' }}>
      <Typography>Number of peers connected: {peers.length}</Typography>
      <List
        itemLayout='horizontal'
        bordered
        dataSource={peers}
        renderItem={(peer) => (
          <List.Item
            onClick={() => {
              setModal({ id: peer.id, type: 'main' });
            }}
          >
            <List.Item.Meta title={peer.id} />
          </List.Item>
        )}
      />
      <Modal
        title={(modal && modal.id) || ''}
        visible={modal && modal.type === 'main'}
        onCancel={() => {
          setModal(undefined);
        }}
        footer={[
          <Button
            key='transaction'
            type='primary'
            onClick={() => {
              setModal({ id: modal!.id, type: 'transaction' });
            }}
          >
            Send VectorCoin
          </Button>,
          <Button type='primary' key='chat' onClick={() => {}}>
            Chat
          </Button>,
          <Button type='primary' key='videochat' onClick={() => {}}>
            Videochat
          </Button>
        ]}
      >
        <p>Connect with this peer through various forms</p>
      </Modal>
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
  );
};
