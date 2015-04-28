'use strict';

var http = require('http');
var express = require('express');
var app = express();
var path = require('path');
var uuid = require('node-uuid');

app.use(express.static(path.join(__dirname, 'dist')));

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.set('port', process.env.PORT || 3000);

var users = [
  {firstname: "Uuno", lastname: "Turhapuro", id:'baf52591-b892-4e7f-9538-e61a61239c1e'},
  {firstname: "Spede", lastname: "Pasanen", id:'2ef7ab86-5769-4f7a-9eb0-9b52ba57de6b'},
  {firstname: "Pelle", lastname: "Hermanni", id:'06e8690b-a7a6-4f79-a1cd-8d1dcb2a5f6f'}
]

function getUser(id) {
  users.forEach(function(user) {
    if (user.id === id) {
      return user;
    }
  });
}

app.get('/api/users/:id?', function(req, res) {
  console.log('get user', req.params.id || '(s)')
  if (req.params.id) {
    res.json(getUser(req.params.id));
  } else {
    res.json(users);
  }
});

app.post('/api/users/:id?', function(req, res) {
  console.log('post user', req.params.id, req.body)
  if (req.params.id) {
    for (var i = 0, len = users.length; i < len; i++) {
      if (users[i].id === req.params.id) {
        users[i] = req.body;
        break;
      }
    }
  } else {
    var user = req.body;
    user.id = uuid.v4();
    users.push(req.body);
  }
  res.send();
});

app.delete('/api/users/:id', function(req, res) {
  console.log('delete user', req.params.id)
  for (var i = users.length - 1; i >= 0; i--) {
    if (users[i].id === req.params.id) {
      users.splice(i, 1);
      break;
    }
  }
  res.send();
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
