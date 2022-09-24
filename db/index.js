const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox-dev');

async function getAllUsers() {
    const { rows } = await client.query(
        `SELECT id, username, name, location, active
        FROM users;
        `);

    return rows;
}

async function createUser({ 
    username, 
    password,
    name,
    location
 }) {
    try {
        const { rows: [user]} = await client.query(`
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

async function updateUser(id, fields = {}) {
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }"=$${ index + 1 }`      
    ).join(', ');

    if (setString.length === 0) {
        return;
    }  
    try {
        const { rows: [ user ]} = await client.query(`
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

async function createPost({
    authorId,
    title,
    content
}) {
    try {
        const { rows: [post]} = await client.query(`
        INSERT INTO post(authorId, title, content)     
        RETURNING *;
        `, [authorId, title, content]);

    return post;
    } catch (error) {
        throw error;
    }
}

async function updatePost(id, {
    title,
    content,
    active
    }) {
    try {
        const { rows: [ post ]} = await client.query(`
            UPDATE post
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;

        `, [title, content, active]);

        return post;
    } catch (error) {
      throw error;
    }
}

async function getAllPosts() {
    const { rows } = await client.query(
        `SELECT authorId, title, content
        FROM posts;
        `);

    return rows;
}

async function getUserById(userId) {
    try {
        const { rows: [user] } = await client.query(`
        SELECT id, username, location, name, active FROM users
        WHERE id=${ userId };
        `);
        if (!user) {
            return NULL;
        } else {
            user.posts = await getPostsByUser(userId)}
        return user;
    } catch (error) {
        throw error;
    }
}

async function getPostsByUser(userId) {
    try {
        const { rows } = await client.query(`
        SELECT * FROM posts
        WHERE "authorId"=${ userId };
        `);

        return rows;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser, 
    getUserById, 
}
