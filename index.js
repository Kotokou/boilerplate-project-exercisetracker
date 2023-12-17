const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const shortUid = require("short-uuid");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

var users = [];

app.post("/api/users", (req, res) => {
  var username = req.body.username;
  if (!username) {
    res.json({ error: "invalid username" });
  }
  var id = shortUid.generate();
  var user = { username: username, _id: id, log: [] };
  users.push(user);

  res.json({ username: user["username"], _id: user["_id"] });
});

app.get("/api/users", (req, res) => {
  var newUsers = [];

  for (let user of users) {
    newUsers.push({ username: user["username"], _id: user["_id"] });
  }

  res.json(newUsers);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  var id = req.params._id;

  if (!id) {
    res.json({ error: "invalid id" });
  }
  var index = users.findIndex((user) => {
    return user["_id"] === id;
  });
  var user = users[index];

  if (!user) {
    res.json({ error: "user not found" });
  }

  var description = req.body.description;
  var duration = req.body.duration;
  var dateString = req.body.date;
  var date = new Date();

  if (!description || !duration) {
    res.json({ error: "invalid body" });
  }

  if (dateString) {
    console.log(date);
    const dateSplits = dateString.split("-");
    const year = parseInt(dateSplits[0]);
    const month = parseInt(dateSplits[1]) - 1;
    const day = parseInt(dateSplits[2]);

    date = new Date(year, month, day);
    console.log(date);
    if (!date) {
      res.json({ error: "invalid date" });
    }
  }

  var dateString = date.toDateString();

  var exercise = {
    username: user["username"],
    description: description,
    duration: parseInt(duration),
    date: dateString,
    _id: user["_id"],
  };

  var log = {
    description: description,
    duration: parseInt(duration),
    date: dateString,
  };

  user["log"].push(log);
  users[index] = user;

  res.json(exercise);
});

app.get("/api/users/:_id/logs", (req, res) => {
  var id = req.params._id;

  if (!id) {
    res.json({ error: "invalid id" });
    return;
  }

  var user = users.find((user) => {
    return user["_id"] === id;
  });

  if (!user) {
    res.json({ error: "user not found" });
    return;
  }

  var logs = [];

  if (req.query.from && req.query.to) {
    logs =
      user["log"].filter((log) => {
        return (
          new Date(log.date) >= new Date(req.query.from) &&
          new Date(log.date) <= new Date(req.query.to)
        );
      }) || [];
  } else {
    logs = user["log"] || [];
  }

  if (req.query.limit) {
    logs = logs.slice(0, parseInt(req.query.limit));
  }

  var response = {
    username: user["username"],
    count: logs.length,
    _id: user["_id"],
    log: logs,
  };
  console.log(response);

  res.json(response);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
