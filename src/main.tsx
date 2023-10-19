import './index.css';

import startSnakeGame from './start';

const searchParams = new URLSearchParams(document.location.search);


startSnakeGame(searchParams.get('gameId') || "MainGame!");
