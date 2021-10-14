import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import loadable from '@loadable/component';

const App = loadable(async () => import('./app/app'), {
  fallback: <div>Loading...</div>,
});

function localStorageProvider() {
  // When initializing, we restore the data from `localStorage` into a map.
  const map = new Map(JSON.parse(localStorage.getItem('app-cache') || '[]'))

  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener('beforeunload', () => {
    const appCache = JSON.stringify(Array.from(map.entries()))
    localStorage.setItem('app-cache', appCache)
  })

  // We still use the map for write & read for performance.
  return map
}

ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <SWRConfig value={{ provider: localStorageProvider }}>
        <App />
      </SWRConfig>
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root')
);
