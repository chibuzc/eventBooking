const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const graphqlHTTP = require("express-graphql");

const mongoose = require("mongoose");
const Event = require("./models/Event");
const User = require("./models/User");
const { DB_USER, DB_PASS } = require("./config");
const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolvers')
const isAuth = require('./middleware/isAuth')

app.use(bodyParser.json());
const DB_URL = `mongodb://127.0.0.1:27017/eventBooking`;

app.use((req,res,next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if(req.method === 'OPTIONS'){
    return res.sendStatus(200);
  }
  next()
})

app.use(isAuth)
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true
  })
);

app.get("/", (req, res, next) => {
  res.send("HELLO World");
});

mongoose
  .connect(DB_URL, () => {
    console.log(mongoose.connection.readyState);
  })
  .then(() => {
    app.listen(8080, "localhost", () => {
      console.log("Server is up and running!!!");
    });
  })
  .catch(err => {
    console.log(err);
  });
