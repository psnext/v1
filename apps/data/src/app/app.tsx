import styles from './app.module.scss';

import { ReactComponent as Logo } from './logo.svg';

import { Route, Link, Switch, Redirect, RouteProps, useHistory } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import {theme, GlobalStylesOverride, AuthProvider, useProviderAuth, useAuth} from '@psni/sharedui';
import loadable from '@loadable/component';
import { CircularProgress } from '@mui/material';

const Home = loadable(async () => import('../pages/home/home'), {
  fallback: <div>Loading...</div>,
})
const Login = loadable(async () => import('../pages/login/login'), {
  fallback: <div>Loading...</div>,
})
const TeamPage = loadable(async () => import('../pages/team/team'), {
  fallback: <div>Loading...</div>,
})
const UserPage = loadable(async () => import('../pages/user/user'), {
  fallback: <div>Loading...</div>,
})

export function App() {
  const authState = useProviderAuth()
  const history = useHistory();
  return (
    <AuthProvider value={authState}>
    <ThemeProvider theme={theme}>
      {GlobalStylesOverride}
      <Switch>
        <AuthRoute
          path="/"
          exact
          render={(props) => <Home {...props}/>}/>
        <AuthRoute
          path="/user/:id"
          exact
          render={(props) => <UserPage {...props}/>}/>
        <AuthRoute
          path="/team"
          exact
          render={(props) => <TeamPage {...props}/>}/>
        <Route
          path="/login"
          exact
          render={(props) => <Login {...props}/>}
        />
      </Switch>
    </ThemeProvider>
    </AuthProvider>
  );
}

function AuthRoute(props: RouteProps) {
  const auth = useAuth();
  const { render, children, ...rest } = props;
  return (
    <Route
      {...rest}
      render={({ location, ...renderProps }) =>
        auth.status === 'loading' ?
        <CircularProgress /> :
        auth.user ? (render?render({location, ...renderProps}):children) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )} />
  )
}

export default App;
