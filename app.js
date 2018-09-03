const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const events = require('./api/events');
const users = require('./api/users');

const auth = require('./middleware/auth');

dotenv.config();
(async () => {

    const client = await MongoClient.connect(process.env.DB);
    const db = client.db('Genesis-18');
    const userDb = client.db('Genesis-18');
    console.log('Connected to database');
    app.use('/events', auth, events(db));
    app.use('/users', users(userDb));

})();

module.exports = app;