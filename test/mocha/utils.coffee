async = require 'async'
app = require '../../server/server'
Divesite = app.models.Divesite
User = app.models.User

createUser = (done) ->
  User.create {email: 'user@example.com', password: 'pass'}, done

tearDown = (done) -> async.parallel [
  (cb) -> User.destroyAll cb
  (cb) -> Divesite.destroyAll cb
], done

module.exports =
  createUser: createUser
  tearDown: tearDown
