const express = require('express')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
// const axios = require('axios')
const bodyParser = require('body-parser')
const engines = require('consolidate')
const helpers = require('./helpers')
//declarations
const app = express()




//set views
app.engine('hbs', engines.handlebars)
app.set('views', './views')
app.set('view engine', 'hbs')

//app use
app.use('/images', express.static('images'))
app.use(bodyParser.urlencoded({
  extended: true
}))

//endpoints
app.get('/', function (req, res) {
  res.send('server is up')
})

app.get('/users', function (req, res) {
  let users = []
  fs.readdir('users', function (err, files) {
    if (err) {
      console.log(err)
      throw err
    }
    files.forEach(function (file) {
      fs.readFile(path.join(__dirname, 'users', file), {
        encoding: 'utf8'
      }, function (err, data) {
        if (err) {
          console.log(err)
          throw err
        }
        const user = JSON.parse(data)
        user.name.full = _.startCase(`${user.name.first} ${user.name.last}`)
        users = users.concat(user)
        if (users.length === files.length) {
          users.sort(helpers.sortAlphabetically)
          res.render('index', {
            users
          })
        }
      })
    })
  })
})

app.all('/*/:username', function (req, res, next) {
  console.log(req.method, 'for', req.params.username)
  next()
})

app.get('*.json', function (req, res) {
  res.download('./users/' + req.path.substring(req.path.lastIndexOf('/')))
})

app.get('/user/:username/raw', function (req, res) {
  const username = req.params.username
  const user = helpers.getUser(username)
  res.json(user)
})

function verifyUser(req, res, next) {
  const filePath = helpers.getUserPath(req.params.username)
  fs.exists(filePath, function (yes) {
    if (yes) {
      next()
    } else {
      res.redirect('/user/error/' + req.params.username)
    }
  })
}

app.route('/user/:username')
  .get(verifyUser, function (req, res) {
    const username = req.params.username
    const user = helpers.getUser(username)
    res.render('user', {
      user
    })
  })

  .put(function (req, res) {
    const username = req.params.username
    let user = helpers.getUser(username)
    user.location = req.body
    helpers.saveUser(username, user)
    res.end()
  })

  .delete(function (req, res) {
    const username = req.params.username
    helpers.deleteUser(username)
    res.sendStatus(200).end()
  })

app.get('/user/error/:username', function (req, res) {
  res.send('user ' + req.params.username + ' does not exist')
})

// app.get('/proxyusers', function (req, res) {
//   axios.get('https://raw.githubusercontent.com/bclinkinbeard/egghead-getting-started-with-express/02-basic-routing/users.json')
//     .then(response => {
//       res.send(response.data)
//     })
//     .catch(error => {
//       console.log(error);
//     });
// })

var server = app.listen(3000, function () {
  console.log(`Server running at http://localtest:${server.address().port}`)
})

//https://egghead.io/lessons/node-js-organize-code-by-subpath-in-express