import express from 'express';
import path from 'path';
import AddWebSockets from './websockets.mjs';
import http from 'http';

const server = http.createServer();
const app = express();

app.use('/',
  express.static( path.resolve('./dist' ) )
);


const port = process.env.PORT || 3000

// app.listen(port, '0.0.0.0', ( err ) => {
//   if ( err ) console.error( err );
//   else console.info( `Listening at http://localhost:${port}` );
// });

AddWebSockets(server, app);

server.on('request', app);

process.on("message", (message) => {
  console.log(message);
});

server.listen(port, () => {
  console.log(`Server listening on port - ${port}`);
})