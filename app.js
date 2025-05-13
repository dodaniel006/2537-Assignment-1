// =========================
// 1. Imports and Configuration
// =========================
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

const expireTime = 1 * 60 * 60 * 1000; // 1 hour expiration
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const session_secret = process.env.NODE_SESSION_SECRET;

let { database } = require('./databaseConnection');
const userCollection = database.db(mongodb_database).collection('users');

const defaultSettings = {
    center: true,
    auth: false,
}

// =========================
// 2. Middleware
// =========================
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded form data
app.use("/css", express.static("./css"));
app.use("/public", express.static("./public"));

var mongoStore = mongoSession.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@assignment-1.vyb56ul.mongodb.net/`,
    crypto: {
        secret: mongodb_session_secret
    },
});

app.use(session({
    secret: session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true
}));

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set('layout', 'templates/layout');
app.use(express.static(__dirname + "/public"));

// =========================
// 3. Helper Functions
// =========================
function checkAuthenticated(req, res, next) {
    if (req.session.authenticated) {
        return res.redirect('/authenticated');
    }
    next();
}

function validateSession(req, res, next) {
    if (!req.session.authenticated) {
        return res.redirect('/login');
    }
    next();
}

function createSettings(userSettings) {
    let settings = Object.assign({}, defaultSettings, userSettings);
    return settings;
}

// =========================
// 4. Routes
// =========================

// Home Page
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index', defaultSettings);
});

// Signup Page
app.get('/signup', checkAuthenticated, (req, res) => {
    res.render('signup', defaultSettings);
});

// Login Page
app.get('/login', checkAuthenticated, (req, res) => {
    res.render('login', defaultSettings);
});

// Signup Submission
app.post('/signupSubmit', async (req, res) => {
    const { name, email, password } = req.body;

    const schema = Joi.object({
        name: Joi.string().alphanum().max(20).required(),
        email: Joi.string().email().required(),
        password: Joi.string().max(20).required(),
    });

    const valid = schema.validate({ name, password, email });
    if (valid.error != null) {
        console.log(valid.error);
        settings = createSettings({ message: valid.error, type: 'signup' });
        res.status(400).render('error', settings);
        return;
    }

    let hashedPassword = bcrypt.hashSync(password, saltRounds);

    await userCollection.insertOne({
        name: name,
        email: email,
        password: hashedPassword,
        user_type: 'user'
    });
    console.log("Inserted user");

    req.session.authenticated = true;
    req.session.email = email;
    req.session.name = name;
    req.session.user_type = 'user';
    req.session.cookie.maxAge = expireTime;

    res.redirect('/members');
});

// Login Submission
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

    const result = await userCollection.find({ email: email }).project({ email: 1, password: 1, name: 1, _id: 1, user_type: 1 }).toArray();
    console.log(result);
    if (result.length < 1) {
        settings = createSettings({ message: 'Error: User not found!', type: 'login' });
        res.status(401).render('error', settings);
        return;
    }

    if (await bcrypt.compare(password, result[0].password)) {

        if (typeof result[0].user_type == 'undefined') {
            await userCollection.updateOne({ email: email }, { $set: { user_type: 'user' } });
            console.log("User type set to user");
        }

        console.log("Password matches!");
        req.session.authenticated = true;
        req.session.email = email;
        req.session.name = result[0].name;
        req.session.user_type = result[0].user_type;
        req.session.cookie.maxAge = expireTime;

        return res.redirect('/members');
    } else {
        console.log("Incorrect password!");
        settings = createSettings({ message: 'Error: Incorrect password!', type: 'login' });
        return res.status(401).render('error', settings);
    }
});

// Members Page
app.get('/members', validateSession, (req, res) => {

    let imagePaths = ['dog1', 'dog2', 'pom'];
    let authorized = req.session.user_type == 'admin' ? true : false;
    settings = createSettings({ name: req.session.name, imagePaths: imagePaths, auth: req.session.authenticated, authorized: authorized });
    res.render('members', settings);
})

app.get('/authenticated', validateSession, (req, res) => {
    settings = createSettings({ name: req.session.name, auth: req.session.authenticated });
    res.render('authenticated', settings);
});

// Admin Page
app.get('/admin', validateSession, async (req, res) => {
    let user = await userCollection.findOne({ email: req.session.email }, { projection: { user_type: 1 } });
    req.session.user_type = user ? user.user_type : undefined;

    if (req.session.user_type == 'admin') {
        const result = await userCollection.find({}).project({ email: 1, name: 1, user_type: 1, _id: 1 }).toArray();
        settings = createSettings({ name: req.session.name, auth: req.session.authenticated, users: result });
        res.render('admin', settings);
    }
    else {
        settings = createSettings({ message: 'Error: You are not an admin!', type: 'members', auth: req.session.authenticated });
        res.status(403).render('error', settings);
    }
});

app.post('/admin/action', async (req, res) => {
    const { email, action } = req.body;

    if (action == 'promote') {
        await userCollection.updateOne({ email: email}, {$set: {user_type: 'admin'}});
        console.log(`User ${email} type set to admin`);
    } else if (action == 'demote') {
        await userCollection.updateOne({ email: email}, {$set: {user_type: 'user'}});
        console.log(`User ${email} type set to user`);
    }

    res.redirect('/admin');
});

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            settings = createSettings({ message: 'Error logging out', type: 'logout' });
            return res.status(500).render('error', settings);
        }
    });
    res.redirect('/');
});

// =========================
// 5. Error Handling
// =========================

// 404 Page
app.get("*error", (req, res) => {
    settings = createSettings({ auth: req.session.authenticated });
    res.status(404).render("404", settings);
});

// =========================
// 6. Start Server
// =========================
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
