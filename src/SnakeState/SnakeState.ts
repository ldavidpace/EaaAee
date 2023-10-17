import { produce } from 'immer';
import isEqual from 'lodash.isequal';
import React from 'react';

type Direction = "L" | "R" | "U" | "D";

type Snake = {
  snakeId: string;
  color: string;
  direction: Direction;
  positioning: Array<{ x: number; y: number }>;
  score: number;
  length: number;
  dead: boolean;
};

type Apple = {
  position: {
    x: number, 
    y: number
  };
}

const STARTING_LENGTH = 12;
const APPLE_LENGTH_ADD = 4;
export const TOP_BOUNDARY = 50;
export const SIDE_BOUNDARY = 100;

let SnakeSingleton: {
  snakes: Record<string, Snake>;
  apples: Array<Apple>;
} = {
  snakes: {},
  apples: [],
};

export const resetState = () => {
  SnakeSingleton = {
    snakes: {},
    apples: [],
  }
}

const tryEatApple = (position: {x: number, y: number}) => {
  const eatenAppleIndex = SnakeSingleton.apples.findIndex((apple) => {
    return isEqual(position, apple.position);
  });
  if (eatenAppleIndex >= 0 ) {
    SnakeSingleton.apples.splice(eatenAppleIndex, 1);
    return true;
  }
  return false;
}

const checkForCollision = (position: {x: number, y: number}) => {
  return Object.values(SnakeSingleton.snakes).some((snake) => {
    return snake.positioning.some(snakePosition => isEqual(snakePosition, position));
  })
}

const snakeListeners: Set<() => void> = new Set();
setInterval(() => {
  snakeListeners.forEach((listener) => listener());
}, 100);

export const useSnakeScore = (snakeId: string) => {
  const [score, setScore] = React.useState(0);
  React.useEffect(() => {
    const handleSnakeScore = () => {
      if (score !== SnakeSingleton.snakes[snakeId]?.score) {
        setScore(SnakeSingleton.snakes[snakeId]?.score);
      }
    }
    snakeListeners.add(handleSnakeScore);
    return () => {
      snakeListeners.delete(handleSnakeScore);
    } 

  }, [snakeId])
  return score;
}

export const useSnake = (snakeId: string, mySnake?: boolean, myColor?: string) => {
  const [snake, setSnake] = React.useState<Snake | undefined>(
    getSnake(snakeId)
  );
  React.useEffect(() => {
    if (!getSnake(snakeId) && mySnake) {
      setSnake(createSnake(snakeId, myColor));
    }
    const updateSnake = () => {
      SnakeSingleton.snakes[snakeId] = produce(
        getSnake(snakeId) || createSnake(snakeId),
        (lastSnake) => {

          const nextPosition = {
            y:
              (lastSnake.positioning[0].y +
                (lastSnake.direction === "D"
                  ? 1
                  : lastSnake.direction === "U"
                  ? -1
                  : 0) +
                100) %
                TOP_BOUNDARY,
            x:
              (lastSnake.positioning[0].x +
                (lastSnake.direction === "R"
                  ? 1
                  : lastSnake.direction === "L"
                  ? -1
                  : 0) +
                100) %
              SIDE_BOUNDARY,
          };

          if (tryEatApple(nextPosition)) {
            lastSnake.length = lastSnake.length + APPLE_LENGTH_ADD;
            lastSnake.score = lastSnake.score + 1;
          }

          if (checkForCollision(nextPosition)) {
            lastSnake.dead = true;
          }


          const keptSnake =
            lastSnake.positioning.length === lastSnake.length
              ? lastSnake.positioning.slice(0, -1)
              : lastSnake.positioning;

          lastSnake.positioning = [
            nextPosition,
            ...keptSnake,
          ];
        }
      );
      setSnake(SnakeSingleton.snakes[snakeId]);
    };
    snakeListeners.add(updateSnake);
    return () => {
      snakeListeners.delete(updateSnake);
    };
  }, [snakeId]);
  return snake;
};

export const useApple = () => {
  const [apple, setApple] = React.useState(SnakeSingleton.apples[0]);
  React.useEffect(() => {
    const updateApple = () => {
      if (!SnakeSingleton.apples.length) {
        SnakeSingleton.apples.push({
          position: {
            x: Math.floor(Math.random() * SIDE_BOUNDARY),
            y: Math.floor(Math.random() * TOP_BOUNDARY),
          }
        });
        setApple(SnakeSingleton.apples[0]);
      }
    }
    snakeListeners.add(updateApple);
    return () => {
      snakeListeners.delete(updateApple);
    }
  }, []);
  return apple;
}

export const getSnake = (snakeId: string) => {
  return SnakeSingleton.snakes[snakeId];
};

export const createSnake = (snakeId: string, color?: string) => {
  if (getSnake(snakeId)) throw new Error("Cannot recreate snake");
  SnakeSingleton.snakes[snakeId] = {
    snakeId,
    color: color || "#ff0000",
    direction: "R",
    positioning: [
      {
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
      },
    ],
    length: STARTING_LENGTH,
    dead: false,
    score: 0,
  };
  return SnakeSingleton.snakes[snakeId];
};

export const setSnakeDirection = (snakeId: string, direction: Direction) => {
  if (!SnakeSingleton.snakes[snakeId]) return;
  SnakeSingleton.snakes[snakeId] = produce(
    SnakeSingleton.snakes[snakeId],
    (lastSnake) => {
      lastSnake.direction = direction;
    }
  );
};
