// Part 2 day 1, section 2
// create a new router (postsRouter)
const express = require('express');
const postsRouter = express.Router();
// PART 2, DAY 3
const { requireUser } = require('./utils');

// PART 2, DAY 3: destructure createPost, updatePost, and getPostById from db
const { createPost, updatePost, getPostById } = require('../db');

// PART 2, DAY 3:
// postsRouter.post('/', requireUser, async (req, res, next) => {
  // res.send({ message: 'under construction' });
// });
postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;
  
  // const authorId = req.user.id
  // First the call to trim() removes any spaces in the front or back, and then split will turn the string into an array, splitting over any number of spaces
  const tagArr = tags.trim().split(/\s+/)

  // add authorId, title, content to postData object
    // const post = await createPost(postData);
    // this will create the post and the tags for us
    // if the post comes back, res.send({ post });
    // otherwise, next an appropriate error object 
  const postData = { authorId, title, content, tags };

  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {

    const post = await createPost(postData);

    if (post) {
      res.send(post);
    } else {
      next({ name: "IncorrectPostError", message: "Missing Content From Post" });
    }

  } catch ({ name, message }) {
    next({ name, message });
  }
});

// Part 2, day 1: Create new router.
postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

  next();
});

const { getAllPosts } = require('../db');

// Part 2; day 1; section 2
// Then add middleware to run when the user makes a GET request to /api/posts.
// When they do, call getAllPosts from our database (don't forget to require it)
// Return the result.
// call getAllPosts and return the result
// Active is now false, but do we want inactive posts when we get all posts?
// We have two places we could change this: at the Database Layer, or at the API Layer.
// I would like to change it at the API layer. Let's leave the database methods alone, and filter out any posts before we return them. Something like this:
postsRouter.get('/', async (req, res, next) => {
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter(post => {
      // // the post is active, doesn't matter who it belongs to
      if (post.active) {
        return true;
      }

      // the post is not active, but it belogs to the current user
      if (req.user && post.author.id === req.user.id) {
        return true;
      }

      return false;
    });

    res.send({
      posts
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// Updating a post is very similar to creating a post, with a few changes. The first change is how we form the route: PATCH /api/posts/:postId. The verb PATCH tells a server that we wish to update some data.
postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
// We are going to expect the body to have the title, or content, or maybe tags. We won't allow the user to change the id or the authorId (that would be silly for our app).
  const { title, content, tags } = req.body;

//  We may not be passed all fields, so we should gingerly build the object, checking to see which ones are passed in.
  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    // Lastly, we should ensure that the post we are trying to update is actually owned by the the user trying to update it. While our front-end might be good at preventing this problem, our back-end should also ensure it is not possible either.
    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost })
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours'
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// Because we've set up an active column in our post table, and (on creation) set it to true by default, we can simply update a post to have active: false (not changing anything else) to delete it.
postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });

      res.send({ post: updatedPost });
    } else {
      next(post ? {
        name: "UnauthorizedUserError",
        message: "You cannot delete a post which is not yours"
      } : {
        name: "PostNotFoundError",
        message: "That post does not exist"
      });
    }

  } catch ({ name, message }) {
    next({ name, message })
  }
});

module.exports = postsRouter;