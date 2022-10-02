const PORT = 3000;
const express = require('express');
const server = express();

const { client } = require('./db');
client.connect();

const morgan = require('morgan');
server.use(morgan('dev'));

server.use(express.json())

server.use((req, res, next) => {
    console.log("<___Body Logger START___>");
    console.log(req.body);
    console.log("<___Body Logger END___>");

    next();
});

server.get('/add/:first/to/:second', (req, res, next) => {
    res.send(`<h1>${req.params.first} + ${req.params.second} = ${Number(req.params.first) + Number(req.params.second)}<h1>`);
});

const apiRouter = require('./api');
server.use('/api', apiRouter);

server.listen(PORT, () => {
    console.log('The server is up on port', PORT)
});



