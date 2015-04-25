'use strict';

var http = require('http');
var express = require('express');
var app = express();
var path = require('path');


app.use(express.static(path.join(__dirname, 'dist')));

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.set('port', process.env.PORT || 3000);

var users = [
  {firstname: "Uuno", lastname: "Turhapuro", id:0},
  {firstname: "Spede", lastname: "Pasanen", id:1},
  {firstname: "Pelle", lastname: "Hermanni", id:2}
]

app.get('/api/users/:id?', function(req, res) {
  console.log('get user', req.params.id || '(s)')
  if (req.params.id) {
    res.json(users[req.params.id]);
  } else {
    res.json(users);
  }
});

app.post('/api/users/:id?', function(req, res) {
  console.log('post user', req.params.id, req.body)
  if (req.params.id) {
    users[req.params.id] = req.body;
  } else {
    users.push(req.body);
  }
  res.send();
});

app.delete('/api/users/:id', function(req, res) {
  console.log('delete user', req.params.id)
  users[req.params.id].splice(req.params.id, 1);
  res.send();
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
