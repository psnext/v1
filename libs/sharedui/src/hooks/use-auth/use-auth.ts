import axios, { AxiosResponse } from 'axios';
import React, { useState, useCallback, useEffect } from 'react';

/**
 * A helper to create a Context and Provider with no upfront default value, and
 * without having to check for undefined all the time.
 */
 function createAuthCtx() {
  const ctx = React.createContext<AuthState | undefined>(undefined);
  function useAuth() {
    const c = React.useContext(ctx);
    if (c === undefined)
      throw new Error("useAuth must be inside a Provider with a value");
    return c;
  }
  return [useAuth, ctx.Provider] as const; // 'as const' makes TypeScript infer a tuple
}

export const [useAuth, AuthProvider] = createAuthCtx();

interface User {
  id: string;
  name: string,
  email?: string,
  picture?: string
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AuthState{
  user: User|null;
  status: string,
  login: (email:string, code?:string)=>Promise<AxiosResponse>,
  logout: ()=>Promise<AxiosResponse>;
}

export function useProviderAuth(): AuthState {
  const [user, setUser] = useState<User|null>(null);
  const [status, setStatus] = useState('loading');
  const getUser = ()=>{
    axios.get('/api/users/me')
      .then((res)=>{
          const data = res.data;
          console.log('logged in')
          setUser(data);
          setStatus('ready');
      })
      .catch((err)=>{
        if (err.response?.status===401) {
          console.warn('not logged in')
          setUser(null);
          setStatus('ready');
          return;
        }
        setStatus('error');
        console.error(err);
      });
  }
  useEffect(()=>{
    setStatus('loading');
    getUser();
  },[]);

  const logout = useCallback(async () => {
    return axios.get('/api/auth/logout')
      .then(res=>{
        setUser(null);
        setStatus('ready');
        return res;
      })
  },[]);

  const login = useCallback(async (email:string, code?:string) => {
    if (code && code!=='') {
      return axios.post('/api/auth/loginwithcode', {email, code})
        .then(res=>{
          if (res.status===200) {
            getUser();
          }
          return res;
        })
    } else {
      return axios.post('/api/users/requestaccess', {email})
    }
   },[]);

  return { user, status, login, logout };
}

