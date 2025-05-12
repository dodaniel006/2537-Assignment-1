const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const mongoSession = require('connect-mongo');
const Joi = require('joi');
const bcrypt = require('bcrypt');
require('dotenv').config();

const saltRounds = 12;

const port = process.env.PORT || 3000;

const app = express();

const expireTime = 1 * 60 * 60 * 1000; //expires after 1 hour (hours * minutes * seconds * millis)

const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;

const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const session_secret = process.env.NODE_SESSION_SECRET;

let { database } = require('./databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

const center = true;

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: false }));

app.use("/css", express.static("./css"));
app.use("/public", express.static("./public"));

var mongoStore = mongoSession.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@assignment-1.vyb56ul.mongodb.net/`,
    crypto: {
        secret: mongodb_session_secret
    },
})

app.use(session({
    secret: session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true
}));

app.set("view engine", "ejs");

app.use(expressLayouts);

app.set('layout', 'templates/layout')

app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
    authenticatedCheck(req, res, 'index', center);
});

function errorMessage(message, type) {
    return `${message}<br><a href="/${type}">Try again</a>`
}

function authenticatedCheck(req, res, path, center) {
    if (req.session.authenticated) {
        res.render('authenticated', { name: req.session.name, authenticated: req.session.authenticated, center: center});
        return;
    }
    res.render(path, { center: center } );
}

app.get('/signup', (req, res) => {
    authenticatedCheck(req, res, 'signup', center);
});

app.get('/login', (req, res) => {
    authenticatedCheck(req, res, 'login', center);
});

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
        console.log(valid.error);
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

    // Log the user in by setting session variables
    req.session.authenticated = true;
    req.session.email = email;
    req.session.name = name;
    req.session.cookie.maxAge = expireTime;

    // Redirect to the members area
    res.redirect('/members');
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
        res.status(401).send(errorMessage('Error: User not found!', 'login'));
        return;
    }

    if (await bcrypt.compare(password, result[0].password)) {
        console.log("Password matches!");
        req.session.authenticated = true;
        req.session.email = email;
        req.session.name = result[0].name;
        req.session.cookie.maxAge = expireTime;

        res.redirect('/members');
        return;
    }
    else {
        console.log("Incorrect password!");
        res.status(401).send(errorMessage('Error: Incorrect password!', 'login'));
        return;
    }

});

app.get('/members', (req, res) => {

    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }

    let imageNumber = Math.floor(Math.random() * 3); // Random number between 0 and 2
    let imagePath;

    if (imageNumber == 0) {
        imagePath = '/dog1.png';
    } else if (imageNumber == 1) {
        imagePath = '/dog2.png';
    } else if (imageNumber == 2) {
        imagePath = '/pom.png';
    }

    res.render('members', { name: req.session.name, imagePath: imagePath, authenticated: req.session.authenticated, param: center });
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
    });
    res.redirect('/');
});

app.get("*dummy", (req, res) => {
    res.status(404);
    res.render("404");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
