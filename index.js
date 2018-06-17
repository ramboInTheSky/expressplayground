const express = require('express')
const fs = require('fs')
const _ = require('lodash')
const axios = require('axios')

//declarations
const app = express()
let users = []


//routines

fs.readFile('users.json', function (err, data) {
  if (err) {
    console.log(err)
  }
  JSON.parse(data).forEach(function (item) {
    item.name.full = _.startCase(`${item.name.first} ${item.name.last}`)
    users = users.concat(item)
  })
});

//set viewa

app.set('views', './views');


//endpoints

app.get('/', function (req, res) {
  res.send('lallero')
})

app.get('/user/:username', function (req, res, next) {
  var username = req.params.username
  res.send(username)
})

app.get('/users', function (req, res) {
  let buffer = ''
  if (users.length) {
    users.forEach(function (user) {
      buffer += '<a href="user/' + user.username + '">' + user.name.full + '</a><br>'
    })
    res.send(buffer)
  }
  else {
    res.send('There are no users available')
  }  
})

app.get('/proxyusers', function (req, res) {
  axios.get('https://raw.githubusercontent.com/bclinkinbeard/egghead-getting-started-with-express/02-basic-routing/users.json')
    .then(response => {
      res.send(response.data)
    })
    .catch(error => {
      console.log(error);
    });
})

var server = app.listen(3000, function () {
  console.log(`Server running at http://localtest:${server.address().port}`)
})