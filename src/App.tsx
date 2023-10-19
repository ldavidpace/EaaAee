import './App.css';

import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';

import styles from './App.module.css';
import ColorOption from './ColorOption/ColorOption';
import SnakeBoard from './SnakeBoard';
import { joinGame, useSnakeScore } from './SnakeState/SnakeState';

const createRandomColor = () => Math.floor(Math.random()*16777215).toString(16);
const colors = [`#${createRandomColor()}`, `#${createRandomColor()}`, `#${createRandomColor()}`,`#${createRandomColor()}`,`#${createRandomColor()}`,`#${createRandomColor()}`];

function App({gameId}: {gameId: string}) {
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [snakeId, setSnakeId] = React.useState<string | undefined>();
  const [myColor, setMyColor] = React.useState(colors[0]);

  React.useEffect(() => {
    joinGame(gameId);
  }, []);

  const handleGameOver = () => {
    setSnakeId(undefined);
    setGameOver(true);
  };

  const handleQuitGame = () => {
    setSnakeId(undefined);
    setGameOver(false);
  }

  const handleStartGame = () => {
    setGameOver(false);
    setSnakeId(uuid());
  };

  const handleColorClick = (color: string) => {
    setMyColor(color);
  };

  const myScore = useSnakeScore(snakeId);

  return (
    <>
      <SnakeBoard
        myColor={myColor}
        mySnakeId={snakeId}
        gameId={!gameOver? gameId: undefined}
        onGameOver={handleGameOver}
        onQuitGame={handleQuitGame}
      />
      {!snakeId && (
        <div className={styles.popover}>
          <div>
            {gameOver
              ? `You did great! Please try again. Final Score ${myScore}`
              : "Click to start your game"}
          </div>
          <div className={styles.colorWrapper}>
            Pick a color
            <div className={styles.colorOptions}>
              {colors.map((color) => (
                <ColorOption
                  key={color}
                  color={color}
                  selected={color === myColor}
                  onClick={() => handleColorClick(color)}
                />
              ))}
            </div>
          </div>
          <button onClick={handleStartGame}>
            {gameOver ? "Click to try again" : "Click to begin"}
          </button>
        </div>
      )}
    </>
  );
}

export default App;
