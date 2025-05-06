const express = require('express');
const session = require('express-session');
const mongoSession = require('connect-mongo');
const Joi = require('joi');
const bcrypt = require('bcrypt');
require('dotenv').config();

const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();

<<<<<<< HEAD
const expireTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds


const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const session_secret = process.env.SESSION_SECRET;
=======
const expireTime = 1 * 60 * 60 * 1000; //expires after 1 hour (hours * minutes * seconds * millis)

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;

const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const session_secret = process.env.NODE_SESSION_SECRET;

let { database } = require('./databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');
>>>>>>> good

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: false }));

<<<<<<< HEAD
var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@assignment-1.vyb56ul.mongodb.net/`,
=======
var mongoStore = mongoSession.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@assignment-1.vyb56ul.mongodb.net/`,
    crypto: {
        secret: mongodb_session_secret
    },
>>>>>>> good
})

app.use(session({
    secret: session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true
}));

<<<<<<< HEAD
app.get('/', (req, res) => {
    res.send(
        `<form method="GET" action="/signup">
            <button>Signup</button>
=======
app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {

    if (req.session.authenticated) {
        res.send(
            `<form method="GET" action="/members"><label>Hello ${req.session.name}, you are Already Logged In!</label><br><button>Members Area</button></form>
            <form method="POST" action="/logout"><button type="submit">Logout</button></form>`
        );
        return;
    }
    res.send(
        `<form method="GET" action="/signup">
            <button>Sign up</button>
>>>>>>> good
        </form>
        <form method="GET" action="/login">
            <button>Login</button>
        </form>`
    );
});

<<<<<<< HEAD
=======
function errorMessage(message, type) {
    return `${message}<br><a href="/${type}">Try again</a>`
}

>>>>>>> good
app.get('/signup', (req, res) => {
    res.send(
        `<div>
            <form method="POST" action="/signupSubmit">
                <label for="Signup">Create User</label><br>
<<<<<<< HEAD
                <input type="text" id="name" name="name" placeholder="name" required><br>
                <input type="email" id="email" name="email" placeholder="example@email.com" required><br>
                <input type="password" id="password" name="password" placeholder="password" required><br>
                <button type="submit">Submit</button>
            </form>
        </div>`
    ); 
=======
                <input type="text" id="name" name="name" placeholder="first name" maxlength="20" required><br>
                <input type="email" id="email" name="email" placeholder="example@email.com" required><br>
                <input type="password" id="password" name="password" placeholder="password" maxlength="20" required><br>
                <button type="submit">Submit</button>
            </form>
        </div>`
    );
>>>>>>> good
});

app.get('/login', (req, res) => {
    res.send(
        `<div>
<<<<<<< HEAD
            <form method="POST" action="/updateCount">
                <label for="Login">Log in</label>
                <input type="email" id="email" name="email" placeholder="example@email.com" required>
                <input type="password" id="password" name="password" placeholder="password" required>
=======
            <form method="POST" action="/loggingin">
                <label for="Login">Log in</label>
                <input type="email" id="email" name="email" placeholder="example@email.com" required>
                <input type="password" id="password" name="password" placeholder="password" maxlength="20" required>
>>>>>>> good
                <button type="submit">Submit</button>
            </form> 
        </div>`
    );
});

<<<<<<< HEAD
app.get('/members', (req, res) => {
    res.send(
        `<div>
            <h1>Welcome to the members page!</h1>
=======
app.post('/signupSubmit', async (req, res) => {
    const { name, email, password } = req.body;

    const schema = Joi.object({
        name: Joi.string().alphanum().max(20).required(),
        email: Joi.string().email().required(),
        password: Joi.string().max(20).required(),
    });

    // Validate the input data using Joi
    const valid = schema.validate({ name, password, email });
    if (valid.error != null) { // If there is an error in validation
        res.status(400).send(errorMessage(valid.error, 'signup'));
        return;
    } // All inputs are valid

    let hashedPassword = await bcrypt.hashSync(password, saltRounds);

    await userCollection.insertOne({
        name: name,
        email: email,
        password: hashedPassword
    });
    console.log("Inserted user");

    res.redirect('/login');
});

app.post('/loggingin', async (req, res) => {
    let { email, password } = req.body;

    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().max(20).required(),
    });
    const validationResult = schema.validate({ email, password });

    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.redirect("/login");
        return;
    }

    const result = await userCollection.find({ email: email }).project({ email: 1, password: 1, name: 1, _id: 1 }).toArray();

    if (result.length != 1) {
        res.status(401).send(errorMessage('Error: User not found!'), 'login');
        return;
    }

    if (await bcrypt.compare(password, result[0].password)) {
        console.log("Password matches!");
        req.session.authenticated = true;
        req.session.email = email;
        req.session.name = result[0].name;
        req.session.cookie.maxAge = expireTime;
        if (!req.session.randNum) {
            req.session.randNum = Math.floor(Math.random() * 3); // Random number between 0 and 2
        }

        res.redirect('/members');
        return;
    }
    else {
        console.log("Incorrect password!");
        res.status(401).send(errorMessage('Error: Incorrect password!'), 'login');
        return;
    }

});

app.get('/members', (req, res) => {

    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }

    let imageNumber = req.session.randNum;
    let imagePath;

    switch (imageNumber) {
        case 0:
            imagePath = '/dog1.jpg';
            break;
        case 1:
            imagePath = '/dog2.png';
            break;
        case 2:
            imagePath = '/pom.png';
            break;
        default:
            imagePath = '/dog1.png'; // Fallback to a default image
    }

    res.send(
        `<div>
            <h1>Welcome to the members page ${req.session.name}!</h1>
            <img src="${imagePath}" alt="Dog" style="width:250px;"><br><br>
>>>>>>> good
            <form method="POST" action="/logout">
                <button type="submit">Logout</button>
            </form>
        </div>`
    );
});

<<<<<<< HEAD
const schema = Joi.object({
    name: Joi.string().alphanum().max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().max(20).required(),
  });

app.post('/signupSubmit', (req, res) => {
    const { name, email, password } = req.body;
    console.log(`Name: ${name}, Email: ${email}, Password: ${password}`);
    
    // Validate the input data using Joi
    const valid = schema.validate({ name, password, email });
    if (valid.error != null) { // If there is an error in validation
        console.log(valid.error);
        const errorDetails = valid.error.details[0].message;
        console.log(errorDetails);
        res.status(400).send(
            `Error: All fields are required!
            <a href="/signup">Try again</a>`
        );
    } else { // All inputs are valid
        let hashedPassword = bcrypt.hashSync(password, saltRounds);
        res.redirect('/login');
    }
});

app.post('/loggingin', (req, res) => {
    
});

=======
>>>>>>> good
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
<<<<<<< HEAD
        res.redirect('/');
    });
=======
    });
    res.redirect('/');
});

app.get("*dummy", (req,res) => {
    res.status(404);
    res.send("Page not found - 404");
>>>>>>> good
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
<<<<<<< HEAD
  })

// async function main() {
//     const uri = "mongodb+srv://130ddo:arrow425@assignment-1.vyb56ul.mongodb.net/";

//     const client = new MongoClient(uri);

//     console.log("Connecting to MongoDB Atlas...");
//     try {
//         await client.connect();

//         await listDatabases(client);
//     } catch (e) {
//         console.error(e);
//     } finally {
//         await client.close();
//     }
    
// }

// main().catch(console.error);

// async function listDatabases(client) {
//     const databasesList = await client.db().admin().listDatabases();

//     console.log("Databases:");
//     databasesList.databases.forEach(db => {
//         console.log(` - ${db.name}`);
//     });

// }
=======
});
>>>>>>> good
