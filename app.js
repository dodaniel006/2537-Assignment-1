const express = require('express');
const session = require('express-session');
const mongoSession = require('connect-mongo');
const Joi = require('joi');
const bcrypt = require('bcrypt');
require('dotenv').config();

const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();

const expireTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds


const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const session_secret = process.env.SESSION_SECRET;

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: false }));

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@assignment-1.vyb56ul.mongodb.net/`,
})

app.use(session({
    secret: session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true
}));

app.get('/', (req, res) => {
    res.send(
        `<form method="GET" action="/signup">
            <button>Signup</button>
        </form>
        <form method="GET" action="/login">
            <button>Login</button>
        </form>`
    );
});

app.get('/signup', (req, res) => {
    res.send(
        `<div>
            <form method="POST" action="/signupSubmit">
                <label for="Signup">Create User</label><br>
                <input type="text" id="name" name="name" placeholder="name" required><br>
                <input type="email" id="email" name="email" placeholder="example@email.com" required><br>
                <input type="password" id="password" name="password" placeholder="password" required><br>
                <button type="submit">Submit</button>
            </form>
        </div>`
    ); 
});

app.get('/login', (req, res) => {
    res.send(
        `<div>
            <form method="POST" action="/updateCount">
                <label for="Login">Log in</label>
                <input type="email" id="email" name="email" placeholder="example@email.com" required>
                <input type="password" id="password" name="password" placeholder="password" required>
                <button type="submit">Submit</button>
            </form> 
        </div>`
    );
});

app.get('/members', (req, res) => {
    res.send(
        `<div>
            <h1>Welcome to the members page!</h1>
            <form method="POST" action="/logout">
                <button type="submit">Logout</button>
            </form>
        </div>`
    );
});

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

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
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