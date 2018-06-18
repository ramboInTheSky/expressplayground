const fs = require('fs')
const path = require('path')
const _ = require('lodash')


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
    })
  } catch (e) {
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
    fs.writeFileSync(filePath, JSON.stringify(user, null, 2), {
      encoding: 'utf8'
    })
  } catch (e) {
    console.log(e)
    throw e
  }
}

function deleteUser(username) {
  const filePath = getUserPath(username)
  try {
    fs.unlinkSync(filePath)
  } catch (e) {
    console.log(e)
    throw e
  }
}

exports = {
  sortAlphabetically,
  getUserPath,
  getUser,
  saveUser,
  deleteUser
}