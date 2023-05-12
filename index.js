// const PORT = 3000;

// // Express is our web server
require('dotenv').config();
const { PORT = 3000} = process.env;
const express = require('express');
const server = express();

const { client } = require('./db');
client.connect(); //Part 2; day 1

server.listen(PORT, () => {
    console.log('The server is up on port', PORT)
});

// // Middleware: any function that can run between a request coming in and a response going out.
// // Morgan logs out each incoming request without us having to write a log in each route.
const morgan = require('morgan');

// // the call on server.use tells the server to always call this function.
server.use(morgan('dev'));

// // express.json reads incoming JSON from requests. 
// // The request's header has to be Content-Type:application/json
// // this allows us to send objexts easily to our server.
server.use(express.json())

// // the server will pass in the request object (built form the client's request),
// // the response object(which has methods to build and send back a response),
// // the next function which will move forward to the next matching middleware.
server.use((req, res, next) => {
    console.log("<___Body Logger START___>");
    console.log(req.body);
    console.log("<___Body Logger END___>");

    next();
});

server.get('/add/:first/to/:second', (req, res, next) => {
    res.send(`<h1>${req.params.first} + ${req.params.second} = ${Number(req.params.first) + Number(req.params.second)}<h1>`);
});

// // Part 2: Day 1:apiRouter
const apiRouter = require('./api');
const { Client } = require('pg');
server.use('/api', apiRouter);





