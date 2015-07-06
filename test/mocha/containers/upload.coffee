async = require 'async'
expect = require('chai').expect
HTTP = require 'http-status-codes'
faker = require 'faker'
path = require 'path'
request = require 'supertest'

utils = require '../utils'
app = require('../../../server/server')
Divesite = app.models.Divesite
User = app.models.User
Image = app.models.Image
Container = app.models.Container

StorageService = require('loopback-component-storage').StorageService

describe "POST /api/containers/{container}/", ->
  storageService = {}
  container = {}
  before (done) ->
    storageService = new StorageService {root: '/tmp/storage', provider: 'filesystem'}
    storageService.createContainer {name: 'c1'}, (err, res) ->
      container = res
      done err
  after (done) ->
    storageService.destroyContainer 'c1', (err, res) ->
      done err

  describe "without authorization", ->
    it "returns HTTP 401", (done) ->
      request app
        .post "/api/containers/c1/upload"
        .attach 'image', path.join __dirname, '../../data/large-dive-flag.jpg'
        .expect HTTP.UNAUTHORIZED, done

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
        .post "/api/containers/c1/upload"
        .set "Authorization", token
        .attach 'image', path.join __dirname, '../../data/large-dive-flag.jpg'
        .expect HTTP.OK, done
