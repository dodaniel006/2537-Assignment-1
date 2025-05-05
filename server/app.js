const express = require('express');
const session = require('express-session');
const mongoSession = require('connect-mongo');
require('dotenv').config();
const app = express();
const port = 8100;

const mongoURI = 'mongodb://localhost:27017/sessions';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected successfully');
});

const store = new MongoDBSession({
    uri: mongoURI,
    collection: 'mySessions',
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
}));

app.get('/', (req, res) => {
    res.send('Hello World!')
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