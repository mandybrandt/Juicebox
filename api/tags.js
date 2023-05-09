// Part 2, day 1, section 3
// create new router: tagsRouter
const express = require('express');
const tagsRouter = express.Router();

const { getAllTags, getPostsByTagName, } = require('../db');

// Make the router
tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags");

  next();
});

// const { getAllPosts, getPostsByTagName, getAllTags } = require('../db');
// const { getAllTags } = require('../db');
  
// Part 2, day 1, section 3
// add middleware to run when the user makes a GET request to /api/tags
// need to add getAllTags to db/index.js
tagsRouter.get('/', async (req, res) => {
  const tags = await getAllTags();

  res.send({
    tags
  });
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
  // read the tagname from the params
  const tagName = req.params.tagName
  try {
     // use our method to get posts by tag name from the db
    // send out an object to the client { posts: // the posts }
    const posts =  await getPostsByTagName(tagName);

    res.send
      ({ posts });

  } catch ({ name, message }) {
    // forward the name and message to the error handler
  }
});

module.exports = tagsRouter;