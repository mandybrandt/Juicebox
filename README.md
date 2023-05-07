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