// In general, in our db/index.js file we should provide the utility functions that the rest of our application will use. 
// We will call them from the seed file, but also from our main application file.
// That is where we are going to listen to the front-end code making AJAX requests to certain routes, and will need to make our own requests to our database.

// import the pg module
const { Client } = require('pg'); //day 1


// supply the db name and location of the database
const client = new Client({connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/juicebox-dev', // day 1
ssl: process.env.NODE_ENV === 'production' ? {rejectUnauthorized: false } : undefined,
});

// Setting up the database.
async function createUser({  //day 1: username and password; day 2: name and location
    username,
    password,
    name,
    location
}) {
    try {
        const { rows: [user] } = await client.query(`
        INSERT INTO users(username, password, name, location) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `, [username, password, name, location]);

        return user;
    } catch (error) {
        throw error;
    }
}

async function updateUser(id, fields = {}) { //day2
    // build the set string
    // Each key in the fields object should match a column name for our table, 
    // and each value should be the new value for it. 
    // We use map to turn each key into a string that looks like "keyName"=$3 where the key name is in quotes (in case the table colum is case sensitive), 
    // and we have a parameter whose numeric value is one greater than the index of that particular key.
    // Once we build the set string, as long as the fields object had something in it, we call our query. 
    // We can safely interpolate the id since we will be passing it in when we call updateUser.
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');
    // return early if this is called without fields
    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [user] } = await client.query(`
            UPDATE users
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;

        `, Object.values(fields));

        return user;
    } catch (error) {
        throw error;
    }
}

// 1st helper function to use throughout the application
async function getAllUsers() {  //day 1: id and username.  Day 2: name, location, and active
    const { rows } = await client.query(
        `SELECT id, username, location, name, active
        FROM users;
        `);
    return rows;
}

// day 2
 // first get the user
    // (1) an object that contains 
    // (2) a `rows` array that (in this case) will contain 
    // (3) one object, which is our user.
  // if it doesn't exist (if there are no `rows` or `rows.length`), return null

  // if it does:
  // delete the 'password' key from the returned object
  // get their posts (use getPostsByUser)
  // then add the posts to the user object with key 'posts'
  // return the user object
async function getUserById(userId) {
    try {
        const { rows: [user] } = await client.query(`
        SELECT id, username, location, name, active 
        FROM users
        WHERE id=${userId};
        `);

        if (!user) {
            return null
        }

        user.posts = await getPostsByUser(userId);

        return user;
    } catch (error) {
        throw error;
    }
}

// Part 2, day 2:
// Looking over our database calls, we have one to look up a user by id, but not by username. Maybe we should go create that
async function getUserByUsername(username) {
    try {
        const { rows: [user] } = await client.query(`
        SELECT *
        FROM users
        WHERE username=$1;
        `, [username]);

        return user;
    } catch (error) {
        throw error;
    }
}

// day 2: (basic function) mimics createUser
// day 3: From a previous step, we currently have createInitialTags(seed.js)
// This will populate some post tags. But realistically we shouldn't need this step, right? Instead, we should update createPost to handle creating tags for us.
async function createPost({ 
    authorId,
    title,
    content,
    tags = [] //this is new for day 3
}) {
    try {
        const { rows: [post] } = await client.query(`
        INSERT INTO posts("authorId", title, content)  
        VALUES($1, $2, $3)   
        RETURNING *;
        `, [authorId, title, content]);

        const tagList = await createTags(tags);

        return await addTagsToPost(post.id, tagList);
    } catch (error) {
        throw error;
    }
}

// day 2 (basic function)
// day 3 We need to separately update the post and the tags. 
// The tag list might have some new tags, but it also might be missing some of the tags that used to be part of the post.
async function updatePost(postId, fields = {}) {
    // // read off the tags & remove that field 
    const { tags } = fields;
    delete fields.tags;

    // build the set string
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');

    try {
        // update any fields that need to be updated.
        if (setString.length > 0) {
            await client.query(`
            UPDATE posts
            SET ${ setString }
            WHERE id=${ postId }
            RETURNING *;

        `, Object.values(fields));
        }

            // return early if there's no tags to update
        if (tags === undefined) {
            return await getPostById(postId);
        }

        // make any new tags that need to be made
        const tagList = await createTags(tags);
        const tagListIdString = tagList.map(
            tag => `${tag.id}`
        ).join(', ');

        // delete any post_tags from the database which aren't in that tagList
        await client.query(`
            DELETE FROM post_tags
            WHERE "tagId"
            NOT IN (${ tagListIdString })
            AND "postId"=$1;
             `, [postId]);

            // and create post_tags as necessary
        await addTagsToPost(postId, tagList);

        return await getPostById(postId);
    } catch (error) {
        throw error;
    }
}

// day 2 (basic function)
// day 3: We also want the associated information (tags and author) on each post. We can use the same trick we did before to get the posts:
async function getAllPosts() {
    try {
        const { rows: postIds } = await client.query(`
            SELECT id
            FROM posts;
            `);

        const posts = await Promise.all(postIds.map(
            post => getPostById(post.id)
        ));

        return posts;
    } catch (error) {
        throw error;
    }
}

// day 2 (basic function)
// day 3: If we modify the original query just to return the post id, we can iterate over each post calling our updated getPostById, which has all the information we want in it.
async function getPostsByUser(userId) {
    try {
        const { rows: postIds } = await client.query(`
        SELECT id
        FROM posts
        WHERE "authorId"=${ userId };
        `);

        const posts = await Promise.all(postIds.map(
            post => getPostById(post.id)
        ));

        return posts;
    } catch (error) {
        throw error;
    }
}

// Day 3: we need to make the right string so that the values interpolate correctly.
async function createTags(tagList) {
    if (tagList.length === 0) {
        return;
    }

// we need something like: $1), ($2), ($3
    const insertValues = tagList.map(
        (_, index) => `$${index + 1}`).join('), (');
// then we can use: (${ insertValues }) in our string template

// we need something like: $1, $2, $3
    const selectValues = tagList.map(
        (_, index) => `$${index + 1}`).join(', ');
// then we can use: (${ selectValues }) in our string template

// We can insert multiple tags at the same time, so our query is formatted a bit differently.
// insert the tags, doing nothing on conflict
// returning nothing, we'll query after
    try {
        await client.query(`
        INSERT INTO tags(name)
        VALUES (${insertValues})
        ON CONFLICT (name) DO NOTHING;
        `, tagList);

// Then, once we create the ones not currently in the table, we should select all the tags passed in from the table, and return them.
// select all tags where the name is in our taglist
// return the rows from the query
        const { rows } = await client.query(`
        SELECT * FROM tags
        WHERE name
        IN (${selectValues});
        `, tagList);

        return rows;
    } catch (error) {
        throw error;
    }
}

// Day 3:
async function createPostTag(postId, tagId) {
    try {
        await client.query(`
        INSERT INTO post_tags("postId", "tagId")
        VALUES ($1, $2)
        ON CONFLICT ("postId", "tagId") DO NOTHING;
        `, [postId, tagId]);
    } catch (error) {
        throw error;
    }
}
// We can now use this multiple times in addTagsToPost. 
// The function createPostTag is async, so it returns a promise. 
// That means if we make an array of non-await calls, we can use them with Promise.all, and then await that:

async function addTagsToPost(postId, tagList) {
    try {
        const createPostTagPromises = tagList.map(
            tag => createPostTag(postId, tag.id)
        );

        await Promise.all(createPostTagPromises);

// That return is using a function which does not yet exist, let's write that, too. 
// We are getting to the point where we want a lot more associated data with our queries. 
// Now we want the tags, too.
        return await getPostById(postId);
    } catch (error) {
        throw error;
    }
}

// Added in Part 2, day 1, section 3
async function getAllTags() {
    try {
        const { rows } = await client.query(`
            SELECT *
            FROM tags;
            `);

        return rows;
    } catch (error) {
        throw error;
    }
}

// Day 3: We will want the post, and its tags, we can do that with two queries. 
// First we need to get the post itself, then get its tags using a JOIN statement. 
// We should also grab the author info using a simple query.
// Last we should add the tags and author to the post before returning it, as well as remove the authorId, since it is encapsulated in the author property.
async function getPostById(postId) {
    try {
        const { rows: [post] } = await client.query(`
        SELECT *
        FROM posts
        WHERE id=$1;
        `, [postId]);

        if (!post) {
            throw {
                name: "PostNotFoundError",
                message: "Could not find a post with that postId"
            };
        }

        const { rows: tags } = await client.query(`
            SELECT tags.*
            FROM tags
            JOIN post_tags ON tags.id=post_tags."tagId"
            WHERE post_tags."postId"=$1;
            `, [postId])

        const { rows: [author] } = await client.query(`
            SELECT id, username, name, location
            FROM users
            WHERE id=$1;
            `, [post.authorId])

        post.tags = tags;
        post.author = author;

        delete post.authorId;

        return post;
    } catch (error) {
        throw error;
    }
}

// Day 3: Here we will use our trick of mapping post ids to posts from our other functions, but we have to get the correct ids.
// One way is to use a double join: connect posts to post_tags, and then post_tags to tags by the appropriate keys, 
// then just select the posts.id where tags.name is correct:
async function getPostsByTagName(tagName) {
    try {
        const { rows: postIds } = await client.query(`
        SELECT posts.id
        FROM posts
        JOIN post_tags ON posts.id=post_tags."postId"
        JOIN tags ON tags.id=post_tags."tagId"
        WHERE tags.name=$1;
        `, [tagName]);

        return await Promise.all(postIds.map(
            post => getPostById(post.id)
        ));
    } catch (error) {
        throw error;
    }
}

// export client and helper functions for global access to the database.
// day 1: client, createUser, getAllUsers
module.exports = {
    client, 
    createUser,
    updateUser,
    getAllUsers,
    getUserById,
    createPost,
    updatePost,
    getAllPosts,
    getPostsByUser,
    createTags,
    addTagsToPost,
    getPostById,
    getAllTags,
    getUserByUsername,
    createPostTag,
    getPostsByTagName,
}
