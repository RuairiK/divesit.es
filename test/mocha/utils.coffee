async = require 'async'
app = require '../../server/server'
Divesite = app.models.Divesite
User = app.models.User

createUser = (done) ->
  User.create {email: 'user@example.com', password: 'pass'}, done

createSites = (done) ->
  async.parallel [
    (cb) -> Divesite.create {
      name: 'SITE_1',
      boatEntry: true,
      shoreEntry: false,
      depth: 10,
      loc: [1, 1],
      minimumLevel: 0
      description: 'SITE_1 DESCRIPTION'
    }, cb
    (cb) -> Divesite.create {
      name: 'SITE_2',
      boatEntry: false,
      shoreEntry: true,
      depth: 20,
      loc: [2, 2]
      minimumLevel: 1
      description: 'SITE_2 DESCRIPTION'
    }, cb
    (cb) -> Divesite.create {
      name: 'SITE_3',
      boatEntry: true,
      shoreEntry: true,
      depth: 30,
      loc: [3, 3]
      minimumLevel: 2
      description: 'SITE_3 DESCRIPTION'
    }, cb
  ], done

tearDown = (done) -> async.parallel [
  (cb) -> User.destroyAll cb
  (cb) -> Divesite.destroyAll cb
], done

module.exports =
  createSites: createSites
  createUser: createUser
  tearDown: tearDown
