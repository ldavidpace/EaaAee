import './App.css';

import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';

import styles from './App.module.css';
import ColorOption from './ColorOption/ColorOption';
import SnakeBoard from './SnakeBoard';
import { resetState, useSnakeScore } from './SnakeState/SnakeState';

const colors = ["#ff0000", "#00ff00", "#0000ff"];

function App() {
  const [gameId, setGameId] = useState<string | undefined>();
  const [gameOver, setGameOver] = useState<boolean>();
  const [snakeId, setSnakeId] = React.useState(uuid());
  const [myColor, setMyColor] = React.useState(colors[0]);

  const handleGameOver = () => {
    setGameId(undefined);
    setGameOver(true);
  };

  const handleQuitGame = () => {
    setGameId(undefined);
    setGameOver(false);
  }

  const handleStartGame = () => {
    resetState();
    setGameId(uuid());
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
        gameId={gameId}
        onGameOver={handleGameOver}
        onQuitGame={handleQuitGame}
      />
      {!gameId && (
        <div className={styles.popover}>
          <div>
            {gameOver
              ? `You did great! Please try again. Final Score ${myScore}`
              : "Click to start your game"}
          </div>
          <div className={styles.colorWrapper}>
            Available Colors
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
