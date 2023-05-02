# Juicebox
What are we building?
Nothing less than a Back-End-Only project. We are going to make a "Simple" Tumblr clone. I use quotes around simple because it will be anything but simple for us to implement.

We will be designing a back-end which has both a Database layer as well as (later) a web server with a custom API, and testing it by curling against the endpoints we create.
The first thing we need to do is install postgres. No problem!

OS X
If you're on a Mac, you can head right over to http://postgresapp.com/ and follow the instructions there to get a full-featured installation of postgres, including the psql command line tool. Be sure to follow the set up your $PATH link and follow the instructions there. Note that if you need to update your shell profile, bash uses ~/.bash_profile and zsh uses ~/.zshrc.

Optionally, we recommend Mac users install Postico, a GUI client to interact with your databses.
Ubuntu (or Windows on your Ubuntu Virtual Machine)
Follow this link for a more in-depth overview. https://help.ubuntu.com/community/PostgreSQL  In general, here's the sequence of commands we've seen work for others:

user@fullstack:~ ()sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres createuser --superuser $USER
createdb $USER

Finally, later when we use the node.js sequelize library, we will attempt to connect to our local PostgreSQL server using Javascript—e.g. var db = new Sequelize('postgres://localhost/database_name'). By default PostgreSQL will require a username and password for such connections, and that means we would have to include that in our Javascript code as well ('postgres://username:password@localhost/database_name'). In order to avoid that headache we've found it's useful to configure "trust" for such connections.

Postgres uses a file, pg_hba.conf, to control who can access the databases, and what they can do when they do it. We will have to edit that file to

# locate the file using the find command
find / -name pg_hba.conf
# you might get some warnings about directories that find can't access, ignore them

# eventually it will find something like this:
# /etc/postgresql/12/main/pg_hba.conf

# use that file path from above here:
sudo vi /etc/postgresql/12/main/pg_hba.conf 
# we need to edit this file as root
Once your in the file editor, use your arrow keys to navigate to lines that look something like this:
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
#local   replication     postgres                                peer
#host    replication     postgres        127.0.0.1/32            md5
#host    replication     postgres        ::1/128                 md5
For now, change the METHOD for the ones with TYPE equal to local or host to trust. That will mean that your local development machine won't need login/password combinations from your node programs to access the database.

# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                trust
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
To change the file in vi:

Type the letter i, which puts you in insert mode
Now you can navigate, use backspace, and type
Once you make changes to the relevant lines above:

Hit your escape key to leave insert mode
Type a colon (:)
Type wq and hit return
This will save the file, and return you to the terminal. Once there, type this:

sudo service postgresql restart
And you should be good to go. One way to check is this:

# go into your postgres db as the user named postgres
psql -U postgres 

# CORRECT SETTINGS:
# psql (9.6.17)
# Type "help" for help.
#
# postgres=# 

# INCORRECT SETTINGS:
# psql: FATAL:  Peer authentication failed for user "postgres"
