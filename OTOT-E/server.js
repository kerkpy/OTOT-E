require('dotenv').config();
// Import express
const express = require('express');
// Import Body parser
const bodyParser = require('body-parser');
// Import Mongoose
const mongoose = require('mongoose');
const cors = require('cors');
const Contact = require("./contactModel")
const redis = require('redis');

// Initialise the app
let app = express();
app.use(cors())

const redisClient = redis.createClient()
console.log(process.env.LOCALDB_URI)
if (!redisClient) {
  console.log("cannot connect to redis");
} else {
  console.log("connected to redis");
}

// Configure bodyparser to handle post requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
// Connect to Mongoose and set connection variable
mongoose.connect(process.env.LOCALDB_URI, { useNewUrlParser: true});
var db = mongoose.connection;

// Added check for DB connection
if(!db)
    console.log("Error connecting db")
else
    console.log("Db connected successfully")

// Setup server port
var port = process.env.PORT || 8080;

// Send message for default URL
app.get('/', (req, res) => res.send('Hello World with Express'));

app.get("/all", async (req, res) => {
  redisClient.get(`contacts`, async (error, contacts) => {
      if (error) console.error(error);
      if (contacts != null) {
          return res.json(JSON.parse(contacts))
      } else {
          const data = await Contact.find({});
          redisClient.setex(
              `contacts`,
              1000,
              JSON.stringify(data)
          )
          res.json(data);
      }
  })
})


app.all('*', (req, res) => { 
    res.status(404).send('<h1>404! Page not found</h1>'); 
  });
// Launch app to listen to specified port
app.listen(port, function () {
    console.log("Running RestHub on port " + port);
});

module.exports = app