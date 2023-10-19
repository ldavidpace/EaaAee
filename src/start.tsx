import React from 'react';
import ReactDOM from 'react-dom/client';
import { v4 as uuid } from 'uuid';

import App from './App';

const startSnakeGame = (gameId= uuid()) => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
          <App 
            gameId={gameId}
          />
        </React.StrictMode>,
      )
}

export default startSnakeGame;