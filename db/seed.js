// grab our client with destructuring from the export in index.js
// Also, grab the helper functions from index.js
// day 1: client, getAllUsers, createUser
const {
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
    getPostsByTagName,
} = require('./index');

// this function should call a query which drops all tables from our database
//day 1: users table only; day 2: posts; day 3: tags
// be sure to drop in correct order since there are now references.
async function dropTables() {  
    try {
        console.log("Starting to drop tables...");

        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;   
        `);

        console.log("Finished dropping tables!");
    } catch (error) {
        console.error("Error dropping tables!");
        throw error; //we pass the error up to the function that calls dropTables
    }
}

// this function should call a query which creates all tables for our database
//day 1: username and password only; day 2:posts; day 3: tags
async function createTables() { 
    try {
        console.log("Starting to build tables...");

        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                active BOOLEAN DEFAULT true
            );
            CREATE TABLE posts ( 
                id SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true
            );
            CREATE TABLE tags (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL
            );
            CREATE TABLE post_tags (
                "postId" INTEGER REFERENCES posts(id), 
                "tagId" INTEGER REFERENCES tags(id),
                UNIQUE ("postId", "tagId")    
            )
            
        `);

        console.log("Finished building tables!");
    } catch (error) {
        console.error("Error building tables!");
        throw error;
    }
}

// Function that attempts to create a few users
async function createInitialUsers() { //day 1: username, password; day 2: name and location
    try {
        console.log("Starting to create users...");

        await createUser({
            username: 'albert',
            password: 'bertie99',
            name: 'Al Bert',
            location: 'Sidney, Australia'
        });
        await createUser({
            username: 'sandra',
            password: '2sandy4me',
            name: 'Just Sandra',
            location: 'Ain\'t tellin\''
        });
        await createUser({
            username: 'glamgal',
            password: 'soglam',
            name: 'Joshua',
            location: 'Upper East Side'
        });

        console.log("Finished creating users!");
    } catch (error) {
        console.error("Error creating users!");
        throw error;
    }
}

// day 2: Testing the methods
// Start by creating a new function createInitialPosts, and call it inside of rebuildDB just after createInitialUsers
// day 3: Update to include tags
async function createInitialPosts() {
    try {
        const [albert, sandra, glamgal] = await getAllUsers();

        console.log("Starting to create posts...");
        await createPost({
            authorId: albert.id,
            title: "First Post",
            content: "This is my first post. I hope I love writing blogs as much as I love reading them.",
            tags: ["#happy", "#youcandoanything"]
        });

        await createPost({
            authorId: sandra.id,
            title: "How does this work?",
            content: "Seriously, does this even do anything?",
            tags: ["#happy", "#worst-day-ever"]
        });

        await createPost({
            authorId: glamgal.id,
            title: "Living the Glam Life",
            content: "Do you even? I swear that half of you are posting.",
            tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
        });
        console.log("Finished creating posts!");
    } catch (error) {
        console.log("Error creating posts!");
        throw error;
    }
}

// Deleted on Day 3. we updated createPost to handle creating tags.
// async function createInitialTags() {
//     try {
//         console.log("Starting to create tags...");

//         const [happy, sad, inspo, catman] = await createTags([
//             '#happy',
//             '#worst-day-ever',
//             '#youcandoanything',
//             '#catmandoeverything'
//         ]);

//         const [postOne, postTwo, postThree] = await getAllPosts();

//         await addTagsToPost(postOne.id, [happy, inspo]);
//         await addTagsToPost(postTwo.id, [sad, inspo]);
//         await addTagsToPost(postThree.id, [happy, catman, inspo]);

//         console.log("Finished creating tags!");
//     } catch (error) {
//         console.log("Error creating tags!");
//         throw error;
//     }
// }

async function rebuildDB() { //day 1: tables and users
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
        // await createInitialTags();
    } catch (error) {
        throw error;
    } 
}

async function testDB() { //day 1: users
    try {
        // connect the client to the database
        // Include helper functions
        // queries are promises, so we can await them
        console.log("Starting to test database...")

        console.log("Calling getAllUsers");
        const users = await getAllUsers();
        console.log("getAllusers:", users);
            // for now, logging helps us see what is going on

        console.log("Calling updateUser on users[0]");
        const updateUserResult = await updateUser(users[0].id, {
            name: "Newname Sogood",
            location: "Lesterville, KY"
        });
        console.log("Result:", updateUserResult);

        console.log("Calling getAllPosts");
        const posts = await getAllPosts();
        console.log("Result:", posts);

        console.log("Calling updatePost on posts[0]");
        const updatePostResult = await updatePost(posts[0].id, {
            title: "New Title",
            content: "Updated Content"
        });
        console.log("Result:", updatePostResult);

        console.log("Calling getUserById with 1");
        const albert = await getUserById(1);
        console.log("Result:", albert);
        
        console.log("Finished database tests!");
    } catch (error) {
        console.error("Error testing database!");
        throw error;
    } 
}

rebuildDB() // day 1
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end()); 




        


//         console.log("Calling getPostsByUser with 1");
//         const user = await getPostsByUser(1);
//         console.log("Result:", user);

//         console.log("getPostById with 1");
//         const id = await getPostById(1);
//         console.log("Result:", id);

//         console.log("Calling updatePost on posts[1], only updating tags");
//         const updatePostTagsResult = await updatePost(posts[1].id, {
//             tags: ["#youcandoanything", "#redfish", "#bluefish"]
//         });
//         console.log("Result:", updatePostTagsResult);

//         console.log("Calling getPostsByTagName with #happy");
//         const postsWithHappy = await getPostsByTagName("#happy");
//         console.log("Result:", postsWithHappy);


