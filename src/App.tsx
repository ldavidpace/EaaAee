import './App.css';

import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';

import styles from './App.module.css';
import ColorOption from './ColorOption/ColorOption';
import { generateSillyName } from './SillyNameGenerator/SillyNameGeneratore';
import SnakeBoard from './SnakeBoard';
import { createSnake, joinGame, useSnakeScore } from './SnakeState/SnakeState';

const createRandomColor = () => {
  let randomHex = Math.floor(Math.random()*16777215).toString(16);
  while (randomHex.length < 6) {
    randomHex += Math.floor(Math.random()*16).toString(16)[0];
  }
  return randomHex;
};

let colors = [`#${createRandomColor()}`, `#${createRandomColor()}`, `#${createRandomColor()}`,`#${createRandomColor()}`,`#${createRandomColor()}`,`#${createRandomColor()}`];

const isColorDark = (color: string) => {
  const sumOfFirstNumbers = parseInt(color[1]) + parseInt(color[3]) + parseInt(color[5]);
  if (isNaN(sumOfFirstNumbers)) return false;
  return sumOfFirstNumbers < 18;
}

while (colors.some((color) => isColorDark(color) )) {
  colors = colors.map((color) => isColorDark(color)? `#${createRandomColor()}`: color);
}

function App({gameId}: {gameId: string}) {
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [snakeId, setSnakeId] = React.useState<string | undefined>();
  const [myColor, setMyColor] = React.useState(colors[0]);

  const [name, setName] = React.useState(generateSillyName());

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
    const newSnakeId = uuid();
    setSnakeId(newSnakeId);
    createSnake(newSnakeId, myColor, name);
  };

  const handleColorClick = (color: string) => {
    setMyColor(color);
  };

  const myScore = useSnakeScore(snakeId);

  const handleNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setName(ev.target.value);
  }
  return (
    <>
      <SnakeBoard
        myColor={myColor}
        mySnakeId={snakeId}
        myName={name}
        gameId={!gameOver? gameId: undefined}
        onGameOver={handleGameOver}
        onQuitGame={handleQuitGame}
      />
      {!snakeId && (
        <div className={styles.popover}>
          <div className={styles.mainTitle}>EaaAee</div>
          <div>
            {gameOver &&  `You did great! Please try again. Final Score ${myScore}`}
          </div>
          <label className={styles.playerNameInput}>
            <span className={styles.label}>Choose your player name</span>
            <input value={name} onChange={handleNameChange} maxLength={120}/>
          </label>
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
          <button onClick={handleStartGame} disabled={name.length < 3}>
            {gameOver ? "Click to try again" : "Click to begin"}
          </button>
          {name.length < 3 && <div>You name must be at least 3 digits long.</div>}
        </div>
      )}
    </>
  );
}

export default App;
