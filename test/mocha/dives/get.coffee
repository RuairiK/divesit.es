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

sites = []
user = {}
maxDepth = faker.random.number(20) + 5
diveData =
  date: faker.date.recent()
  maxDepth: maxDepth
  averageDepth: maxDepth / 2
  comment: faker.lorem.sentence(20)
  airTemp: faker.random.number(20)
  waterTemp: faker.random.number(20)
  duration: faker.random.number(60)

setup = (done) ->
  async.series [
    (cb) -> utils.tearDown cb
    (cb) -> utils.createSites cb
    (cb) -> utils.createUser cb
    (cb) ->
      Divesite.find (err, res) ->
        sites = res
        cb err
    (cb) ->
      User.findOne (err, res) ->
        user = res
        cb err
    (cb) ->
      diveData.divesiteId = sites[0].id
      diveData.userId = user.id
      Dive.create diveData, cb
    (cb) ->
      diveData.divesiteId = sites[1].id
      diveData.userId = user.id
      Dive.create diveData, cb
  ], done


describe "GET /api/divesites/{id}/dives", ->

  before setup
  after utils.tearDown

  it "returns HTTP 200", (done) ->
    request app
      .get "/api/divesites/#{sites[0].id}/dives"
      .expect HTTP.OK, done
  it "returns a list", (done) ->
    request app
      .get "/api/divesites/#{sites[0].id}/dives"
      .end (err, res) ->
        expect(res.body).to.be.an.Array
        done err
  it "returns only the dives logged at the site", (done) ->
    request app
      .get "/api/divesites/#{sites[0].id}/dives"
      .end (err, res) ->
        expect(res.body).to.have.length 1
        expect(res.body[0].divesiteId).to.equal sites[0].id
        done err

describe "GET /api/divesites/{id}/dives/{pk}", ->

  before setup
  after utils.tearDown

  describe "with valid IDs", ->
    it "returns HTTP 200", (done) ->
      Dive.findOne {divesiteId: sites[0]}, (err, res) ->
        request app
          .get "/api/divesites/#{sites[0].id}/dives/#{res.id}"
          .expect HTTP.OK, done
    it "returns a JSON object", (done) ->
      Dive.findOne {divesiteId: sites[0]}, (err, res) ->
        request app
          .get "/api/divesites/#{sites[0].id}/dives/#{res.id}"
          .expect "Content-Type", /json/
          .end (err, res) ->
            expect(res.body).to.be.an.Object
            done err


describe "GET /api/users/{id}/dives", ->

  user2 = {}
  before (done) -> setup done

  beforeEach (done) -> async.series [
    # Create a second user
    (cb) ->
      User.create {email: 'user2@example.com', password: 'pass'}, (err, res) ->
        user2 = res
        cb err
    # Log a dive by user2
    (cb) ->
      diveData.userId = user2.id
      Dive.create diveData, cb
  ], done
  afterEach (done) -> async.parallel [
    (cb) -> User.destroyById user2.id, cb
    (cb) -> Dive.destroyAll {where: {userId: user2.id}}, cb
  ], done

  after utils.tearDown

  describe "with a valid user ID", ->

    it "returns HTTP 200", (done) ->
      request app
        .get "/api/users/#{user.id}/dives"
        .expect HTTP.OK, done
    it "returns a list", (done) ->
      request app
        .get "/api/users/#{user.id}/dives"
        .end (err, res) ->
          expect(res.body).to.be.an.Array
          done err
    it "returns the expected number of Dives", (done) ->
      request app
        .get "/api/users/#{user.id}/dives"
        .end (err, res) ->
          expect(res.body).to.have.length 2
          done err

    it "doesn't expose the user's email address", (done) ->
      request app
        .get "/api/users/#{user.id}/dives"
        .end (err, res) ->
          dive = res.body[0]
          expect(dive).not.to.have.property "email"
          done err

describe "GET /api/users/{id}/dives/count", ->
  dive = {}
  before (done) -> setup done
  after utils.tearDown
  beforeEach (done) ->
    diveData.userId = user.id
    Dive.create diveData, (err, res) ->
      dive = res
      done err

  it "returns HTTP 200", (done) ->
    request app
      .get "/api/users/#{user.id}/dives/count"
      .expect HTTP.OK, done

describe "GET /api/users/{id}/dives/{pk}", ->
  dive = {}
  before (done) -> setup done
  after utils.tearDown

  beforeEach (done) ->
    diveData.userId = user.id
    Dive.create diveData, (err, res) ->
      dive = res
      done err

  afterEach (done) -> async.parallel [
    (cb) -> Dive.destroyAll cb
  ], done

  describe "with a valid dive ID", ->

    it "returns HTTP 200", (done) ->
      request app
        .get "/api/users/#{user.id}/dives/#{dive.id}"
        .expect HTTP.OK, done
