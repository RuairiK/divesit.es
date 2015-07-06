async = require 'async'
app = require '../../server/server'
Divesite = app.models.Divesite
User = app.models.User
Image = app.models.Image
Dive = app.models.Dive

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


createOwnedSite = (done) ->
  async.waterfall [
    (cb) -> User.create {email: 'user@example.com', password: 'pass', displayName: 'Test User'}, cb
    (user, cb) -> Divesite.create {
      name: "Test Divesite",
      boatEntry: true,
      shoreEntry: true,
      depth: 10,
      minimumLevel: 0
      description: "A dive site"
      loc: [0, 0],
      userId: user.id
    }, cb
  ], done

tearDown = (done) -> async.parallel [
  (cb) -> User.destroyAll cb
  (cb) -> Divesite.destroyAll cb
  (cb) -> Image.destroyAll cb
  (cb) -> Dive.destroyAll cb
], done

module.exports =
  createSites: createSites
  createUser: createUser
  tearDown: tearDown
  createOwnedSite: createOwnedSite
