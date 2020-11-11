import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Main, Chat } from './containers';

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path='/chat'>{<Chat />}</Route>
        <Route path='/'>{<Main />}</Route>
      </Switch>
    </BrowserRouter>
  );
};

export default App;
