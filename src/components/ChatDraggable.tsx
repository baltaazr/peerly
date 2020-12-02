import React from 'react';
import Draggable from 'react-draggable';
import styled from 'styled-components';
import { Typography, Divider, Card } from 'antd';

type ChatDraggableProps = {
  messages: { timestamp: string; sender: boolean; content: string }[];
  id: string;
};

const { Title } = Typography;

const StyledCard = styled(Card)`
  height: 300px;
  width: 300px;
  background-color: white;
`;

const MessageBox = styled.span<{ sender: boolean }>`
  padding: 6px 12px;
  background-color: ${({ sender }) =>
    sender ? 'rgb(0, 153, 255)' : 'rgb(241, 240, 240)'};
  color: ${({ sender }) => (sender ? 'white' : 'black')};
  border-radius: 1.3em;
`;

export const ChatDraggable = ({ messages, id }: ChatDraggableProps) => {
  return (
    <Draggable defaultPosition={{ x: 100, y: 100 }}>
      <StyledCard title={id}>
        {messages.map(({ timestamp, sender, content }) => {
          if (sender) {
            return (
              <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                <MessageBox sender>{content}</MessageBox>
              </div>
            );
          }
          return (
            <div>
              <MessageBox sender={false}>{content}</MessageBox>
            </div>
          );
        })}
      </StyledCard>
    </Draggable>
  );
};
