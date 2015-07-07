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
    before (done) -> utils.createOwnedSite done

    token = {}
    userId = {}
    site = {}

    beforeEach (done) -> async.parallel [
      (cb) -> User.login {email: "user@example.com", password: "pass"}, (err, res) ->
        token = res.id
        userId = res.userId
        cb err
      (cb) -> Divesite.findOne (err, res) ->
        site = res
        cb err
    ], done

    afterEach (done) -> Image.destroyAll done

    it "requires a divesite in the header", (done) ->
      request app
        .post "/api/containers/c1/upload"
        .set "Authorization", token
        .attach 'image', path.join __dirname, '../../data/large-dive-flag.jpg'
        .expect 422, done

    it "returns HTTP 200", (done) ->
      request app
        .post "/api/containers/c1/upload"
        .set "Authorization", token
        .set "divesite", site.id
        .attach 'image', path.join __dirname, '../../data/large-dive-flag.jpg'
        .expect HTTP.OK, (err, res) ->
          done err

    it "creates an associated Image", (done) ->
      request app
        .post "/api/containers/c1/upload"
        .set "Authorization", token
        .set "divesite", site.id
        .attach "image", path.join __dirname, '../../data/large-dive-flag.jpg'
        .end (err, res) ->
          Image.find (err, images) ->
            expect(images).to.be.an.Array
            expect(images).to.have.length 1
            image = images[0]
            expect(image.userId).to.equal userId
            expect(image.divesiteId).to.equal site.id
            done err
