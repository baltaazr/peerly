import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Main } from './containers';
import 'antd/dist/antd.css';

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path='/'>{<Main />}</Route>
      </Switch>
    </BrowserRouter>
  );
};

export default App;
