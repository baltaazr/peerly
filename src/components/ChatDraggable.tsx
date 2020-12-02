import React from 'react';
import Draggable from 'react-draggable';
import styled from 'styled-components';
import { Card } from 'antd';
import PerfectScrollbar from 'react-perfect-scrollbar';
import e from 'express';

type ChatDraggableProps = {
  messages: { timestamp: string; sender: boolean; content: string }[];
  id: string;
};

const StyledCard = styled(Card)`
  position: relative;
  height: 300px;
  width: 300px;
  background-color: white;
`;

const MessageBox = styled.span<{
  sender: boolean;
  topRight?: boolean;
  botRight?: boolean;
  topLeft?: boolean;
  botLeft?: boolean;
}>`
  padding: 6px 12px;
  margin: 1px;
  background-color: ${({ sender }) =>
    sender ? 'rgb(0, 153, 255)' : 'rgb(241, 240, 240)'};
  border-radius: 1.3em;
  border-top-right-radius: ${({ topRight }) => (topRight ? '4px' : null)};
  border-bottom-right-radius: ${({ botRight }) => (botRight ? '4px' : null)};
  border-top-left-radius: ${({ topLeft }) => (topLeft ? '4px' : null)};
  border-bottom-left-radius: ${({ botLeft }) => (botLeft ? '4px' : null)};
  color: ${({ sender }) => (sender ? 'white' : 'black')};
`;

const MessageBoxInput = styled(MessageBox)`
  position: absolute;
  margin: 0px;
  bottom: 10px;
  width: calc(100% - 48px);
`;

const MessageInput = styled.input`
  background-color: rgb(241, 240, 240);
  border: none;

  &:focus {
    outline: none;
  }
`;

const ScrollBox = styled.div`
  height: 160px;
  overflow-y: scroll;

  /* width */
  ::-webkit-scrollbar {
    width: 5px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #fff;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 2px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

export const ChatDraggable = ({ messages, id }: ChatDraggableProps) => {
  return (
    <Draggable defaultPosition={{ x: 100, y: 100 }}>
      <StyledCard title={id}>
        <ScrollBox>
          {messages.map(({ sender, content }, idx) => {
            if (sender) {
              let top = false,
                bot = false;
              if (idx > 0 && messages[idx - 1].sender) top = true;
              if (idx < messages.length - 1 && messages[idx + 1].sender)
                bot = true;
              return (
                <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                  <MessageBox sender topRight={top} botRight={bot}>
                    {content}
                  </MessageBox>
                </div>
              );
            } else {
              let top = false,
                bot = false;
              if (idx > 0 && !messages[idx - 1].sender) top = true;
              if (idx < messages.length - 1 && !messages[idx + 1].sender)
                bot = true;
              return (
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <MessageBox sender={false} topLeft={top} botLeft={bot}>
                    {content}
                  </MessageBox>
                </div>
              );
            }
          })}
        </ScrollBox>
        <MessageBoxInput sender={false}>
          <MessageInput placeholder='Type a message...' />
        </MessageBoxInput>
      </StyledCard>
    </Draggable>
  );
};
