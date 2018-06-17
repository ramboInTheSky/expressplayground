const express = require('express')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const axios = require('axios')
const bodyParser = require('body-parser')
const engines = require('consolidate')

//declarations
const app = express()


//routines
// fs.readFile('users.json', function (err, data) {
//   if (err) {
//     console.log(err)
//   }
//   JSON.parse(data).forEach(function (item) {
//     item.name.full = _.startCase(`${item.name.first} ${item.name.last}`)
//     users = users.concat(item)
//   })
// });


//helpers
function sortAlphabetically(a, b) {
  if (a.name.last > b.name.last) {
    return 1
  }
  if (a.name.last < b.name.last) {
    return -1
  }
  return 0
}

function getUserPath(username) {
  return path.join(__dirname, 'users', username) + '.json'
}

function getUser(username) {
  let userFile
  try {
    userFile = fs.readFileSync(getUserPath(username), {
      encoding: 'utf8'
    }, )
  }
  catch (e) { 
    console.log(e)
    return null
  }
  let user = JSON.parse(userFile)
  user.name.full = _.startCase(`${user.name.first} ${user.name.last}`)
  _.keys(user.location).forEach(function (key) {
    user.location[key] = _.startCase(user.location[key])
  })
  return user
}

function saveUser(username, user) { 
  const filePath = getUserPath(username)
  try {
    fs.unlinkSync(filePath)
    fs.writeFileSync(filePath, JSON.stringify(user, null, 2), { encoding: 'utf8' })
  }
  catch (e) {
    console.log(e)
    throw e
  }
}

function deleteUser(username) {
  const filePath = getUserPath(username)
  try {
    fs.unlinkSync(filePath)
  }
  catch (e) {
    console.log(e)
    throw e
  }
 }


//set views
app.engine('hbs', engines.handlebars)
app.set('views', './views');
app.set('view engine', 'hbs')

//app use
app.use('/images', express.static('images'))
app.use(bodyParser.urlencoded({extended: true}))

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
          users.sort(sortAlphabetically)
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
  const user = getUser(username)
  res.json(user)  
})

function verifyUser(req, res, next) { 
  const filePath = getUserPath(req.params.username)
  fs.exists(filePath, function (yes) { 
    if (yes) {
      next()
    }
    else {
      res.redirect('/user/error/' + req.params.username)
    }  
  })
}

app.get('/user/:username', verifyUser, function (req, res, next) {
  const username = req.params.username
  const user = getUser(username)
      res.render('user', {
      user
    })
})


app.get('/user/error/:username', function (req, res, next) { 
  res.send('user ' + req.params.username + ' does not exist')
})

app.put('/user/:username', function (req, res, next) {
  const username = req.params.username
  let user = getUser(username)
  user.location = req.body
  saveUser(username, user)
  res.end()
})

app.delete('/user/:username', function (req, res, next) {
  const username = req.params.username
  deleteUser(username)
  res.sendStatus(200).end()
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