// Part 2, Day 1: const express and usersRouter
const express = require('express');
// const { reset } = require('nodemon');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');

// Day 1: allows us to get the users from the database and send them back.
// Day 2: add createUser to destructuring from the database
const { getAllUsers, getUserByUsername, createUser } = require('../db');

// Part 2, Day 1: an example route. 
usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

// Day 1: That middleware will fire whenever a GET request is made to /api/users
// The async request gets and returns the users from the database.
usersRouter.get('/', async (req, res) => {
  const users = await getAllUsers();

  res.send({
    users
  });
});

// Part 2, day 2: When a POST request comes in to /api/users/register, we need to read off the 4 fields, and create a new user.
// First, we should check to see if that username is already taken, and if so, pass next a reasonable error.
// If not, try to create the user with the supplied fields.
// On success, sign and return a token with the user.id and the username.
// And, as usual: catch any errors from the try block, and forward them to our error handling middleware.
usersRouter.post('/register', async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: 'UserExistsError',
        message: 'A user by that username already exists'
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      location
    });

    const token = jwt.sign({
      id: user.id,
      username
    }, process.env.JWT_SECRET, {
      expiresIn: '1w'
    });

    res.send({
      message: "thank you for signing up",
      token
    });
  } catch ({ name, message }) {
    next({ name, message })
  }
});

// Part 2, day 2: set up the route:
// usersRouter.post('/login', async (req, res, next) => {
  // console.log(req.body);
  // res.end();
// }); Then add the following:
usersRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password"
    });
  }

  const token = jwt.sign({ id: 1, username: 'albert' }, process.env.JWT_SECRET);

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      res.send({ message: "you're logged in!", token });

    } else {
      next({
        name: 'IncorrectCredentialsError',
        message: 'Username or password is incorrect'
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = usersRouter;