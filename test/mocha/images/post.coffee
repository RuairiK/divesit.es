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
      it "requires a site ID", (done) ->
        data = JSON.parse JSON.stringify validSiteData
        delete data.divesiteId
        request app
          .post '/api/images'
          .set 'Authorization', token
          .send data
          .expect 422, done
      it "requires an image URL", (done) ->
        data = JSON.parse JSON.stringify validSiteData
        delete data.url
        request app
          .post '/api/images'
          .set 'Authorization', token
          .send data
          .expect 422, done
      it "checks that a divesite ID resolves to a Divesite", (done) ->
        data = JSON.parse JSON.stringify validSiteData
        data.divesiteId = siteIds.reverse()[0] + 1 # i.e., the highest ID + 1
        request app
          .post '/api/images'
          .set 'Authorization', token
          .send data
          .expect 422, done

    describe "and valid data", ->
      it "returns HTTP 200", (done) ->
        request app
          .post '/api/images'
          .set 'Authorization', token
          .send validSiteData
          .expect 200, done
      it "creates an Image instance", (done) ->
        request app
          .post '/api/images'
          .set 'Authorization', token
          .send validSiteData
          .end (err, res) ->
            Image.find (err, images) ->
              expect(images.length).to.equal 1
              done err
      it "sets the requesting user as the owner of the Image", (done) ->
        request app
          .post '/api/images'
          .set 'Authorization', token
          .send validSiteData
          .end (err, res) ->
            Image.findOne (err, image) ->
              expect(image.userId).to.equal userId
              done err
