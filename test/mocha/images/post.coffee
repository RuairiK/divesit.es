async = require 'async'
expect = require('chai').expect
HTTP = require('http-status-codes')
faker = require 'faker'
request = require('supertest')
path = require 'path'

utils = require '../utils'
app = require('../../../server/server')
Divesite = app.models.Divesite
User = app.models.User
Image = app.models.Image

describe "POST /api/images", ->

  beforeEach (done) -> async.parallel [
    (cb) -> utils.createSites cb
    (cb) -> utils.createUser cb
  ], done
  afterEach utils.tearDown


  describe "without authorization", ->
    it "returns HTTP 401", (done) ->
      request app
        .post '/api/images'
        .send {'url': faker.image.image()}
        .expect 401, done
    it "doesn't create an Image", (done) ->
      request app
        .post '/api/images'
        .send {'url': faker.image.image()}
        .end (err, res) ->
          Image.find {}, (err, images) ->
            expect(images.length).to.equal 0
            done err


  describe "with authorization", ->
    token = {}
    userId = {}
    siteIds = []
    validSiteData = {}

    beforeEach (done) ->
      User.login {'email': 'user@example.com', 'password': 'pass'}, (err, accessToken) ->
        if (err)
          throw err
        token = accessToken.id
        userId = accessToken.userId
        done err

    beforeEach (done) ->
      Divesite.find (err, sites) ->
        siteIds = (site.id for site in sites).sort()
        validSiteData =
          divesiteId: siteIds[0]
          url: faker.image.image()
        done err

    describe "and invalid data", ->
      it "returns HTTP 401", (done) ->
        data = JSON.parse JSON.stringify validSiteData
        delete data.divesiteId
        request app
          .post '/api/images'
          .set 'Authorization', token
          .send data
          .expect HTTP.UNAUTHORIZED, done

    describe "and valid data", ->
      it "returns HTTP 401", (done) ->
        request app
          .post '/api/images'
          .set 'Authorization', token
          .send validSiteData
          .expect HTTP.UNAUTHORIZED, done
