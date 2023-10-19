import { produce } from 'immer';
import isEqual from 'lodash.isequal';
import React from 'react';
import { v4 as uuid } from 'uuid';

type Direction = "L" | "R" | "U" | "D";

type Snake = {
  snakeId: string;
  color: string;
  direction: Direction;
  positioning: Array<{ x: number; y: number }>;
  score: number;
  dead: boolean;
};

type Apple = {
  id: string,
  value: number,
  position: {
    x: number, 
    y: number
  };
}

const STARTING_LENGTH = 12;
const APPLE_LENGTH_ADD = 4;
export const TOP_BOUNDARY = 50;
export const SIDE_BOUNDARY = 100;

declare global {
  interface Window {
    SnakeSingleton: {
      gameId?: string;
      mySnakeId?: string;
      snakes: Record<string, Snake>;
      apples: Array<Apple>;
    }
  }
}

window.SnakeSingleton = produce({
  snakes: {},
  apples: [],
}, (state) => state);

const updateSnakes = () => {
  snakeListeners.forEach(listener => listener());
}
const snakeListeners: Set<() => void> = new Set();
setInterval(() => {
  updateSnakes();
}, 100);

const updateAddSnake = () => {
  addSnakeListeners.forEach(listener => listener());
}

const addSnakeListeners: Set<() => void> = new Set();
const listenForAddSnake = (callback: () => void) => {
  addSnakeListeners.add(callback);
}
const stopListeningForAddSnake = (callback: () => void) => {
  addSnakeListeners.delete(callback);
}

const createApple = () => {
  return {
    id: uuid(),
    value: APPLE_LENGTH_ADD,
    position: {
      x: Math.floor(Math.random() * SIDE_BOUNDARY),
      y: Math.floor(Math.random() * TOP_BOUNDARY),
    }
}
}

var socket: WebSocket;
export const joinGame = async (gameId: string) => {
  if (socket) return;
    window.SnakeSingleton = produce(window.SnakeSingleton, (state) => {
      state.gameId = gameId;
    })
  socket = new WebSocket(document.location.href.startsWith('http://localhost')? 'ws://localhost:3000/websockets': 'ws://www.smmog.com/websockets');

  socket.onmessage = (message) => {
    try {
      const messageData = JSON.parse(message.data);
      if (messageData.type === 'SNAKE_JOINED') {
        socket.send(JSON.stringify({
          type: 'CURRENT_STATE',
          gameId,
          state: window.SnakeSingleton,
        }));
      }
      if (messageData.type === 'CURRENT_STATE') {
        if (!messageData.state) return;
        window.SnakeSingleton = produce(messageData.state as typeof window.SnakeSingleton, () => {});
        updateAddSnake();
      }
      if (messageData.type === 'SNAKE_ADDED') {
        if (window.SnakeSingleton.snakes[messageData.snake.snakeId]) return 
        window.SnakeSingleton = produce(window.SnakeSingleton, (state) => {
          state.snakes[messageData.snake.snakeId] = messageData.snake;
        });
        updateAddSnake();
      }
      if (messageData.type === 'SNAKE_DIRECTION_CHANGE') {
        if (messageData.snakeId !== window.SnakeSingleton.mySnakeId) {
          window.SnakeSingleton = produce(window.SnakeSingleton, (state) => {
            state.snakes[messageData.snakeId].direction = messageData.direction;
            state.snakes[messageData.snakeId].positioning = messageData.positioning;
          });
        }
      }
      if (messageData.type === 'SNAKE_REMOVED') {
        window.SnakeSingleton = produce(window.SnakeSingleton, (state) => {
          delete state.snakes[messageData.snakeId];
        })
        updateAddSnake();
      }
      if (messageData.type === 'APPLE_EATEN') {
        window.SnakeSingleton = produce(window.SnakeSingleton, (state) => {
          const eatenApple = state.apples.find((apple) => apple.id === messageData.appleId);
          if (eatenApple) {
            state.snakes[messageData.snakeId].score += eatenApple.value;
          }
          state.apples = state.apples.filter((apple) => apple.id !== messageData.appleId);
          if (messageData.newApple && !state.apples.some((apple) => apple.id === messageData.newApple.id)) {
            state.apples.push(messageData.newApple);
          }
        })
      }
    } catch(err) {
      console.warn(err);
    }
  }

  socket.onopen = () => {
    socket.send(JSON.stringify({
      type: 'JOIN_GAME', 
      gameId
    }));
  }

}


export const resetState = () => {
  window.SnakeSingleton = {
    snakes: {},
    apples: [],
  }
}

const tryEatApple = (snakeId: string) => {
  const snake = window.SnakeSingleton.snakes[snakeId];
  if (!snake) return;
  const position = snake.positioning[0];
  const eatenAppleIndex = window.SnakeSingleton.apples.findIndex((apple) => {
    return isEqual(position, apple.position);
  });
  const eatenApple = window.SnakeSingleton.apples[eatenAppleIndex];
  if (eatenAppleIndex >= 0 ) {
    let createdApple;
    window.SnakeSingleton = produce(window.SnakeSingleton, (state) => {
      state.apples.splice(eatenAppleIndex, 1);
      if (eatenAppleIndex === 0) {
        state.apples.push(createApple());
        createdApple = true;
      }
      state.snakes[snakeId].score += eatenApple.value; 
    });

    socket.send(JSON.stringify({
      type: 'APPLE_EATEN',
      gameId: window.SnakeSingleton.gameId,
      appleId: eatenApple.id,
      newApple: createdApple && window.SnakeSingleton.apples[window.SnakeSingleton.apples.length - 1],
      snakeId,
    }));

    return eatenApple.value;
  }
  return 0;
}

const checkForCollision = (position: {x: number, y: number}) => {
  return Object.values(window.SnakeSingleton.snakes).some((snake) => {
    return snake.positioning.some(snakePosition => isEqual(snakePosition, position));
  })
}

export const useAllSnakeIds = () => {
  const [snakes, setSnakes] = React.useState(Object.values(window.SnakeSingleton.snakes).map((snake) => snake.snakeId));
  
  React.useEffect(() => {
    const onAddSnake = () => {
      setSnakes(Object.values(window.SnakeSingleton.snakes).map((snake) => snake.snakeId));
    };
    listenForAddSnake(onAddSnake);
    return () => {
      stopListeningForAddSnake(onAddSnake);
    }
  })
  return snakes;
}

export const useSnakeScore = (snakeId?: string) => {
  const [score, setScore] = React.useState(0);
  React.useEffect(() => {
    if (!snakeId) return;
    const handleSnakeScore = () => {
      if (score !== window.SnakeSingleton.snakes[snakeId]?.score) {
        setScore(window.SnakeSingleton.snakes[snakeId]?.score);
      }
    }
    snakeListeners.add(handleSnakeScore);
    return () => {
      snakeListeners.delete(handleSnakeScore);
    } 

  }, [snakeId]);
  return score;
}

export const useSnake = (snakeId: string) => {
  const [snake, setSnake] = React.useState<Snake | undefined>(
    getSnake(snakeId)
  );
  React.useEffect(() => {
    if (!getSnake(snakeId)) {
      console.log('Cannot find snakeID', snakeId);
      return 
    }
    if (snake?.dead) return;
    const updateSnake = () => {
      if (!window.SnakeSingleton.snakes[snakeId]) return;
      window.SnakeSingleton = produce(window.SnakeSingleton, state => {
        const lastSnake = state.snakes[snakeId];
          const nextPosition = {
            y:
              (lastSnake.positioning[0].y +
                (lastSnake.direction === "D"
                  ? 1
                  : lastSnake.direction === 'L' || lastSnake.direction === 'R'
                  ? 0
                  : -1) +
                100) %
                TOP_BOUNDARY,
            x:
              (lastSnake.positioning[0].x +
                (lastSnake.direction === "R"
                  ? 1
                  : lastSnake.direction === "D" || lastSnake.direction === "U"
                  ? 0
                  : -1) +
                100) %
              SIDE_BOUNDARY,
          };


          if (checkForCollision(nextPosition)) {
            lastSnake.dead = true;
          }

          if (lastSnake.dead) return;


          const keptSnake =
            lastSnake.positioning.length >= STARTING_LENGTH + lastSnake.score
              ? lastSnake.positioning.slice(0, -1)
              : lastSnake.positioning;

          lastSnake.positioning = [
            nextPosition,
            ...keptSnake,
          ];
        });
        if (snakeId === window.SnakeSingleton.mySnakeId) {
          tryEatApple(snakeId);
        }
      setSnake(getSnake(snakeId));
    };
    snakeListeners.add(updateSnake);
    return () => {
      snakeListeners.delete(updateSnake);
    };
  }, [snakeId, snake?.dead]);
  return snake;
};

export const useAllApples = () => {
  const [apples, setApples] = React.useState(window.SnakeSingleton.apples?.map(apple => apple.id));
  React.useEffect(() => {
    const updateApple = () => {
      if (apples.length !== window.SnakeSingleton.apples.length || !apples.every((appleId) => Boolean(window.SnakeSingleton.apples.find(apple=> {
        return apple.id === appleId
      })))) {
        setApples(window.SnakeSingleton.apples.map(apple => apple.id));
      }
      if (!window.SnakeSingleton.apples.length) {
        window.SnakeSingleton = produce(window.SnakeSingleton, (state) => {
          state.apples.push(createApple());
        });
      }
    }
    snakeListeners.add(updateApple);
    return () => {
      snakeListeners.delete(updateApple);
    }
  }, [apples]);
  return apples;
}

export const useApple = (appleId: string) => {
  return window.SnakeSingleton.apples.find((apple) => apple.id === appleId);
}

export const getSnake = (snakeId: string) => {
  return window.SnakeSingleton.snakes[snakeId];
};

export const createSnake = (snakeId: string, color?: string) => {
  if (getSnake(snakeId)) {
    return getSnake(snakeId);
  };
  window.SnakeSingleton = produce(window.SnakeSingleton, state => {
    state.mySnakeId = snakeId;
    state.snakes[snakeId] = {
      snakeId,
      color: color || "#ff0000",
      direction: "R",
      positioning: [
        {
          x: Math.floor(Math.random() * 100),
          y: Math.floor(Math.random() * 100),
        },
      ],
      dead: false,
      score: 0,
    };
  });
  addSnakeListeners.forEach((listener) => listener());
  const socketMessage = {
    type: 'NEW_SNAKE',
    gameId: window.SnakeSingleton.gameId,
    snake: window.SnakeSingleton.snakes[snakeId],
  };
  socket?.send(JSON.stringify(socketMessage));
  return window.SnakeSingleton.snakes[snakeId];
};

export const setSnakeDirection = (snakeId: string, direction: Direction) => {
  if (!window.SnakeSingleton.snakes[snakeId]) return;
  window.SnakeSingleton = produce(window.SnakeSingleton, state => {
    state.snakes[snakeId].direction = direction;
  });
  const socketMessage = {
    type: 'SNAKE_DIRECTION_CHANGE',
    gameId: window.SnakeSingleton.gameId,
    snakeId: snakeId,
    positioning: window.SnakeSingleton.snakes[snakeId].positioning,
    direction: direction,
  }
  socket?.send(JSON.stringify(socketMessage));
};

export const isColorUsed = (color: string) => {
  return Object.values(window.SnakeSingleton.snakes)
    .some(snake => snake.color === color);
}
