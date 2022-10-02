const express = require('express');
const tagsRouter = express.Router();

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags");

  next();
});

const { getAllTags, getPostsByTagName, getAllPosts } = require('../db');

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
  const tags = await getAllTags();
  const posts = await getPostsByTagName();

  try {
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