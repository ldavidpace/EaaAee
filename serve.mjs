import express from 'express';
import path from 'path';

const app = express();

console.log(path.resolve('./dist' ));

app.use('/',
  express.static( path.resolve('./dist' ) )
);

// app.use('/', (req, res) => {
//     console.log(import.meta.url);
//     res.sendFile(path.resolve('./dist/index.html' ));
// })
const port = process.env.PORT || 3000

app.listen(port, 'localhost', ( err ) => {
  if ( err ) console.error( err );
  else console.info( `Listening at http://localhost:${port}` );
});
