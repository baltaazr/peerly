import React from 'react';
import { useHistory } from 'react-router-dom';

export const Main = () => {
  const history = useHistory();

  return (
    <div>
      <button
        onClick={() => {
          history.push('/chat');
        }}
      >
        Chat
      </button>
    </div>
  );
};
