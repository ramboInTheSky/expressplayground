const express = require('express')
const fs = require('fs')
const helpers = require('./helpers')


//declarations
const router = express.Router({
  mergeParams: true
})

router.all('/', function (req, res, next) {
  console.log(req.method, 'for', req.params.username)
  next()
})

router.get('/raw', function (req, res) {
  const username = req.params.username
  const readable = fs.createReadStream('./users/' + username + '.json')
  // const user = helpers.getUser(username)
  // res.json(user)
  readable.pipe(res)
})

function verifyUser(req, res, next) {
  const filePath = helpers.getUserPath(req.params.username)
  fs.exists(filePath, function (yes) {
    if (yes) {
      next()
    } else {
      res.redirect('/error/' + req.params.username)
    }
  })
}

router.route('/')
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

module.exports = router