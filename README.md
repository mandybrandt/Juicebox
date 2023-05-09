# Juicebox
What are we building?
Nothing less than a Back-End-Only project. We are going to make a "Simple" Tumblr clone. I use quotes around simple because it will be anything but simple for us to implement.

We will be designing a back-end which has both a Database layer as well as (later) a web server with a custom API, and testing it by curling against the endpoints we create.
The first thing we need to do is install postgres. No problem!

OS X
If you're on a Mac, you can head right over to http://postgresapp.com/ and follow the instructions there to get a full-featured installation of postgres, including the psql command line tool. Be sure to follow the set up your $PATH link and follow the instructions there. Note that if you need to update your shell profile, bash uses ~/.bash_profile and zsh uses ~/.zshrc.

Optionally, we recommend Mac users install Postico, a GUI client to interact with your databses.
Start with psql:
Setting up:  sudo-apt-get
createdb
psql // see if you're in (mandy=#)
\q to get out.

mandy=# CREATE DATABASE users;
\c name_of_database; */connect to the database/*
Once in the database:
CREATE TABLE users(id SERIAL PRIMARY KEY, username varchar(255) UNIQUE NOT NULL, password varchar(255) NOT NULL);
\d //shows table

mandy=#INSERT INTO users (username, password) VALUES ('albert', 'bertie99'), */add values for all users/*

//Check tables
SELECT * FROM users;
SELECT id, username FROM users WHERE username='albert' AND password='bertie99';

Move into node
npm install pg
npm install nodemon --save-dev //live reload
edit "scripts" in package.json:
{
    "scripts": {
        "seed:dev": "nodemon ./db/seed.js"
    }
}

Seeding
When we talk about seeding, we mean one or more of the following:

Making sure that the tables have correct definitions
Making sure that the tables have no unwanted data
Making sure that the tables have some data for us to play with
Making sure that the tables have necessary user-facing data
We are going to primarily use our seed file to build/rebuild the tables, and to fill them with some starting data. We need a programmatic way to do this, rather than having to connect directly to the SQL server and directly type in the queries by hand.

Let's work a bit on these goals, starting with dropping and rebuilding the tables:

Updating our Users Table
We need to add the following fields:

name VARCHAR(255) NOT NULL
location VARCHAR(255) NOT NULL
active BOOLEAN DEFAULT true
So go back to your table definition in db/seed.js and update the table definition accordingly.

PART 2:
Node
Express
Use express
Provide endpoints with 4 "verbs"
GET /posts (see posts)
POST /posts (create post)
PATCH /posts/:id (update post)
DELETE /posts/:id (deactivate post)
Paramaterized routes
GET /tags/:tagName/posts (list of all posts with that tagname)
Sub-routes
/api/tags as a sub-route of /api
JWT
jwt and jwt-express
HTTP Requests

PART 2, DAY 2: JSON WEB TOKENS
EXAMPLE: 
const token = jwt.sign({ id: 3, username: 'joshua' }, 'server secret', { expiresIn: '1h' });

token; // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Impvc2h1YSIsImlhdCI6MTU4ODAyNDkwMSwiZXhwIjoxNTg4MDI4NTAxfQ.LGqAMv7Bc7xKKHiQp8m4bpqR53h5dJBOZ4Kv2b9qmqY'

const recoveredData = jwt.verify(token, 'server secret');

recoveredData; // { id: 3, username: 'joshua', iat: 1588024901, exp: 1588028501 }

// wait 1 hour:

jwt.verify(token, 'server secret');

// Uncaught TokenExpiredError: jwt expired {
//   name: 'TokenExpiredError',
//   message: 'jwt expired',
//   expiredAt: 2020-04-27T21:58:57.000Z
// }

THE USER REQUEST
We will require the front end to make requests that look like this:

fetch('our api url', {
  method: 'SOME_METHOD',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer HOLYMOLEYTHISTOKENISHUGE'
  },
  body: JSON.stringify({})
})
We need the Content-Type set so that our bodyParser module will be able to read off anything we need from the user (like form data).

We need the Authorization set so that we can read off that Bearer token. It will look something like this:

server.use(async (req, res, next) => {
  const prefix = 'Bearer '
  const auth = req.headers['Authorization'];

  if (!auth) {
    next(); // don't set req.user, no token was passed in
  }


  if (auth.startsWith(prefix)) {
    // recover the token
    const token = auth.slice(prefix.length);
    try {
      // recover the data
      const { id } = jwt.verify(data, 'secret message');

      // get the user from the database
      const user = await getUserById(id);
      // note: this might be a user or it might be null depending on if it exists

      // attach the user and move on
      req.user = user;

      next();
    } catch (error) {
      // there are a few types of errors here
    }
  }
})

PART 2 DAY 3
Writing `DELETE /api/posts/:id`
Let's start our journey into deactivation at the post level. We will need to do two things:

Hook up the route that will let us deactivate the post.
Possibly update existing methods/routes that return posts to the client depending on if they should have access to deactivated posts (or not).
