async = require 'async'
expect = require('chai').expect
HTTP = require('http-status-codes')
request = require('supertest')
faker = require 'faker'

utils = require '../utils'
app = require('../../../server/server')
Divesite = app.models.Divesite
User = app.models.User
Dive = app.models.Dive

describe "POST /api/divesites/{id}/dives", ->

  maxDepth = faker.random.number(20) + 5
  diveData =
    date: faker.date.recent()
    maxDepth: maxDepth
    averageDepth: maxDepth / 2
    comment: faker.lorem.sentence(20)
    airTemp: faker.random.number(20)
    waterTemp: faker.random.number(20)
    duration: faker.random.number(60)

  site = {}
  user = {}
  before (done) -> async.series [
    (cb) -> utils.tearDown cb
    (cb) -> utils.createSites cb
    (cb) -> utils.createUser cb
    (cb) ->
      Divesite.findOne (err, res) ->
        site = res
        cb err
    (cb) ->
      User.findOne (err, res) ->
        user = res
        cb err
  ], done
  after utils.tearDown

  afterEach (done) -> Dive.destroyAll done


  it "requires authentication", (done) ->
    request app
      .post "/api/divesites/#{site.id}/dives"
      .send diveData
      .expect HTTP.UNAUTHORIZED
      .end done

  describe "with authorization", (done) ->
    token = {}
    userId = {}
    beforeEach (done) ->
      User.login {'email': 'user@example.com', 'password': 'pass'}, (err, accessToken) ->
        token = accessToken.id
        userId = accessToken.userId
        done err
    it "returns HTTP 200", (done) ->
      request app
        .post "/api/divesites/#{site.id}/dives"
        .set "Authorization", token
        .send diveData
        .expect HTTP.OK
        .end done
    it "adds a logged dive to the database", (done) ->
      request app
        .post "/api/divesites/#{site.id}/dives"
        .set "Authorization", token
        .send diveData
        .end (err, res) ->
          Dive.find (err, res) ->
            expect(res.length).to.equal 1
            done err
    it "assigns the requesting user's ID to the dive", (done) ->
      request app
        .post "/api/divesites/#{site.id}/dives"
        .set "Authorization", token
        .send diveData
        .end (err, res) ->
          Dive.findOne (err, res) ->
            console.log res
            expect(res.userId).to.equal userId
            done err
