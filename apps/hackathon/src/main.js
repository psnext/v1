import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import {BrowserRouter, Switch, Route} from 'react-router-dom';

import App from './app/app';
import RLogin from './app/rlogin';
import RScore from './app/rscore';
ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <Switch>
          <Route
            path="/"
            exact
            render={(props) => <App {...props}/>}
          />
          <Route
            path="/rlogin"
            exact
            render={()=><RLogin/>}
          />
          <Route
            path="/rscore"
            exact
            render={()=><RScore/>}
          />
      </Switch>
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root')
);
