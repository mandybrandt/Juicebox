// Part 2, day 1, section 3
// create new router: tagsRouter
const express = require('express');
const tagsRouter = express.Router();


// Make the router
tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags");

  next();
});

const { getAllTags, getPostsByTagName, getAllPosts } = require('../db');
  

// Part 2, day 1, section 3
// add middleware to run when the user makes a GET request to /api/tags
// need to add getAllTags to db/index.js
tagsRouter.get('/:tagName/posts', async (req, res, next) => {
  try {
    const allTags = await getAllTags(req.params.tags);
    const tagName = await getPostsByTagName(req.params.tagName);
    const allPosts = await getAllPosts();
    const posts = allPosts.filter(post => {
      if (post.active) {
        return true;
      }

      if (req.user && post.author.id === req.user.id) {
        return true;
      }

      return false;
    });

    res.send
      ({ posts: posts });

  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = tagsRouter;