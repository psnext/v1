import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import {BrowserRouter, Switch, Route} from 'react-router-dom';

import App from './app/app';
import RLogin from './app/rlogin';
import RLogout from './app/rlogout';
import RScore from './app/rscore';
import useSWR, { SWRConfig } from 'swr'
import RSummary from './app/rsummary';
ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <SWRConfig value={{ provider: () => new Map() }}>
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
              path="/rlogout"
              exact
              render={()=><RLogout/>}
            />
            <Route
              path="/rscore"
              exact
              render={()=><RScore/>}
            />
            <Route
              path="/rsummary"
              exact
              render={()=><RSummary/>}
            />
        </Switch>
      </SWRConfig>
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root')
);
