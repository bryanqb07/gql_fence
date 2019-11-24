const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("../config/keys").MONGO_URI;
const expressGraphQL = require("express-graphql");
require('./models/index');
const schema = require('./schema/schema');

const app = express();

if (!db) {
    throw new Error("You must provide a string to connect to MongoDB Atlas");
}

mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch(err => console.log(err));

// remember we use bodyParser to parse requests into json
app.use(bodyParser.json());

app.use(cors());

app.use(
    "/graphql",
    expressGraphQL(req => {
        return {
            schema,
            // we are receiving the request and can check for our
            // auth token under headers
            context: {
                token: req.headers.authorization
            },
            graphiql: true
        };
    })
);

module.exports = app;