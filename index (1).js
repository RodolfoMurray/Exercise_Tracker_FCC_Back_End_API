const express = require('express')
const app = express()
const cors = require('cors')
let bodyParser = require("body-parser");
require('dotenv').config()

app.use(bodyParser.urlencoded({ extended: true }));

const crypto = require("crypto");
const id = crypto.randomBytes(12).toString("hex");

var Exercises = [];
var Users = [];

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', function(req, res) {

  if (req.body && req.body.username) {
    const newUser = { username: req.body.username, _id: crypto.randomBytes(16).toString("hex") };
    Users.push(newUser);
    res.json(newUser);
  } else {
    res.status(400).send("Missing username");
  }
});

app.get('/api/users', function(req, res) {
  res.json(Users);
});

app.post('/api/users/:_id/exercises', function(req, res) {

  if (req.params && req.params._id) {
    if (req.body && req.body.description && req.body.duration) {
      var date = new Date().toDateString();
      if (req.body.date)
        date = new Date(req.body.date).toDateString();
      const user = Users.find((user) => user._id === req.params._id);
      if (user) {
        const newExercise = {
          _id: req.params._id, username: user.username,
          date: date,
          duration: parseInt(req.body.duration),
          description: req.body.description,
        };
        Exercises.push(newExercise);
        res.json(newExercise);
      } else {
        res.status(400).send("User non existant");
      }

    } else {
      res.status(400).send("Missing Arguments");
    }
  } else
    res.status(400).send("Missing Argument _id");
});

app.get('/api/users/:_id/logs', function(req, res) {

  if (req.params && req.params._id) {
    const logsOutput = [];
    var logs = [];
    const username = Users.find((user) => user._id === req.params._id).username;

    if (username) {
      var newLog = [];
      Exercises.forEach(exercise => {
        if (exercise._id === req.params._id) {
          newLog = { description: exercise.description, duration: exercise.duration, date: exercise.date }
          logs.push(newLog);
        }
      });
      if (req.query.to && req.query.from) {
        console.log("i'm inside date and from")
        var result = logs.filter((log) => {
          const dateFrom = new Date(req.query.from);
          const dateTo = new Date(req.query.to);
          const dateLog = new Date(log.date);
          console.log(log);
          console.log(dateFrom);
          console.log(dateTo);
          console.log(dateFrom <= dateLog && dateLog <= dateTo);
          return dateFrom < dateLog && dateLog < dateTo;
        });
        console.log(result);
        logs = result;
      }
        
      if (req.query.limit) {
        console.log(req.query.limit);
        if (logs.length > req.query.limit) {
          const numberOfPop = logs.length - req.query.limit;
          for (let i = 0; i < numberOfPop; i++)
            logs.pop();
        }
        console.log(logs);
      }
      const newLogOutput = { _id: req.params._id, username: username, count: logs.length, log: logs }
      logsOutput.push(newLogOutput);
      res.json(newLogOutput);
    } else {
      res.status(400).send("User non existant");
    }

  } else
    res.status(400).send("Missing Argument _id");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
