import {WebSocketServer} from "ws";
import {v4 as uuid} from 'uuid';


const websocketListenersByGame = {}

const sendMessageToGame = (gameId, message) => {
  websocketListenersByGame[gameId].forEach((listener) => {
    listener.connection.send(JSON.stringify(message));
  });
}

export default async (server, ) => {
  
  const websocketServer = new WebSocketServer({
    server: server,
    path: '/websockets'
  });


  

  websocketServer.on(
    "connection",
    function connection(websocketConnection, connectionRequest) {
      const connectionParams = new URLSearchParams(connectionRequest?.url);
      const requestId = websocketConnection.id = uuid();
      websocketConnection.id = requestId;

      // NOTE: connectParams are not used here but good to understand how to get
      // to them if you need to pass data with the connection to identify it (e.g., a userId).

      websocketConnection.on("message", (message) => {
        try{
          const parsedMessage = JSON.parse(message);
          if (!parsedMessage.gameId) {
            console.warn('Message with no gameId', parsedMessage);
            return;
          };
          if (parsedMessage.type === 'JOIN_GAME') {
            if (!websocketListenersByGame[parsedMessage.gameId]?.length) {
              websocketListenersByGame[parsedMessage.gameId] = [];
              websocketConnection.send(JSON.stringify({type: 'NEW_GAME'}));
              websocketListenersByGame[parsedMessage.gameId].push({
                host: true,
                status: 'updated',
                connection: websocketConnection,
              });
            } else {
              websocketListenersByGame[parsedMessage.gameId].filter((listener) => listener.host).forEach(({connection}) => {
                connection.send(JSON.stringify({'type': 'SNAKE_JOINED'}));
              });
              websocketListenersByGame[parsedMessage.gameId].push({
                status: 'waiting',
                connection: websocketConnection,
              });
            }
          } else if (parsedMessage.type === 'CURRENT_STATE') {
            websocketListenersByGame[parsedMessage.gameId].filter((listener) => listener.status === 'waiting').forEach((listener) => {
              listener.connection.send(JSON.stringify(parsedMessage));
              listener.status = 'updated';
            });
          } else if (parsedMessage.type === 'NEW_SNAKE') {
            if (websocketConnection.snakeId) {
              snakeRemoved(parsedMessage.gameId, websocketConnection.snakeId);
            }
            websocketConnection.snakeId = parsedMessage.snake.snakeId;
            sendMessageToGame(parsedMessage.gameId, {
              type: 'SNAKE_ADDED',
              snake: parsedMessage.snake,
            });
          } else if (parsedMessage.type === 'SNAKE_DIRECTION_CHANGE' || parsedMessage.type === 'APPLE_EATEN' || parsedMessage.type === 'SNAKE_DEAD') {
            sendMessageToGame(parsedMessage.gameId, parsedMessage);
          } else {
            console.log(parsedMessage)
          }
          
          
        } catch(err) {
          console.log(err);
        }
      });

      websocketConnection.on("close", function close(websocketConnection) {
        Object.entries(websocketListenersByGame).forEach(([gameId, listeners]) => {
          listeners.forEach(({connection}, index) => {
            if (connection.id === this.id) {
              snakeRemoved(gameId, connection.snakeId);
              listeners[index] = null;
            }
          })
          websocketListenersByGame[gameId] = listeners.filter(Boolean);
          if (websocketListenersByGame[gameId].length > 0 && !websocketListenersByGame[gameId].some((listener) => listener.host)) {
            websocketListenersByGame[gameId][0].host = true;
          }
        });
      });
    }
  );

  const snakeRemoved = (gameId, snakeId) => {
    sendMessageToGame(gameId, {
      type: 'SNAKE_REMOVED',
      snakeId: snakeId,
    });
  }

  return websocketServer;
};