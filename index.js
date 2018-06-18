const express = require('express')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
// const axios = require('axios')
const bodyParser = require('body-parser')
const engines = require('consolidate')
const helpers = require('./helpers')
const userRouter = require('./user')
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
app.use('/user/:username', userRouter)

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

app.get('*.json', function (req, res) {
  res.download('./users/' + req.path.substring(req.path.lastIndexOf('/')))
})

app.get('/error/:username', function (req, res) {
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

