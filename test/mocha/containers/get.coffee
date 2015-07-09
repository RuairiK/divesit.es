async = require 'async'
expect = require('chai').expect
HTTP = require('http-status-codes')
request = require('supertest')
faker = require 'faker'

utils = require '../utils'
app = require('../../../server/server')
Divesite = app.models.Divesite
User = app.models.User
Image = app.models.Image
Container = app.models.Container

StorageService = require('loopback-component-storage').StorageService

describe "GET /api/containers", ->
  storageService = {}
  container = {}
  before (done) ->
    storageService = new StorageService {root: '/tmp/test-storage', provider: 'filesystem'}
    storageService.createContainer {name: 'c1'}, (err, res) ->
      container = res
      done err
  after (done) ->
    storageService.destroyContainer 'c1', (err, res) ->
      done err

  describe "without authorization", ->
    it "returns HTTP 200", (done) ->
      request app
        .get "/api/containers"
        .expect HTTP.OK, done

  describe "with authorization", ->
    before utils.createUser
    after (done) -> User.destroyAll done

    token = {}
    userId = {}

    beforeEach (done) ->
      User.login {email: "user@example.com", password: "pass"}, (err, res) ->
        token = res.id
        userId = res.userId
        done err

    it "returns HTTP 200", (done) ->
      request app
        .get "/api/containers"
        .expect HTTP.OK, done

describe "GET /api/containers/{name}", ->
  storageService = {}
  container = {}
  before (done) ->
    storageService = new StorageService {root: '/tmp/test-storage', provider: 'filesystem'}
    storageService.createContainer {name: 'c1'}, (err, res) ->
      container = res
      done err
  after (done) ->
    storageService.destroyContainer 'c1', (err, res) ->
      done err

  describe "without authorization", ->

    it "returns HTTP 200", (done) ->
      request app
        .get "/api/containers"
        .expect HTTP.OK, done

  describe "with authorization", ->
    before utils.createUser
    after (done) -> User.destroyAll done

    token = {}
    userId = {}

    beforeEach (done) ->
      User.login {email: "user@example.com", password: "pass"}, (err, res) ->
        token = res.id
        userId = res.userId
        done err

    it "returns HTTP 200", (done) ->
      request app
        .get "/api/containers"
        .set "Authorization", token
        .expect HTTP.OK, done
