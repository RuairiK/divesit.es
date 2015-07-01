async = require 'async'
expect = require('chai').expect
HTTP = require('http-status-codes')
request = require('supertest')

utils = require '../utils'
app = require('../../../server/server')
Divesite = app.models.Divesite
User = app.models.User

siteData =
  name: "TEST_SITE"
  depth: 50
  description: 'TEST_SITE description'
  boatEntry: true
  shoreEntry: true
  minimumLevel: 0
  loc:
    lng: 0
    lat: 0


describe "POST /divesites", () ->

  beforeEach utils.createUser
  afterEach utils.tearDown

  describe "without authorization", () ->
    it "returns HTTP 401 and doesn't add a new site", (done) ->
      request app
        .post '/api/divesites'
        .expect 'Content-type', /json/
        .expect HTTP.UNAUTHORIZED
        .end (err, res) ->
          # Check that there's nothing in the db
          Divesite.find (err, res) ->
            expect(res).to.be.an.Array
            expect(res).to.be.empty
            done err

  describe "with authorization", ->

    token = {}
    userId = {}

    beforeEach (done) ->
      User.login {'email': 'user@example.com', 'password': "pass"}, (err, accessToken) ->
        token = accessToken.id
        userId = accessToken.userId
        done err

    it "returns HTTP 200", (done) ->
      request app
        .post '/api/divesites'
        .set 'Authorization', token
        .send siteData
        .expect HTTP.OK
        .end done
    it "returns JSON", (done) ->
      request app
        .post '/api/divesites'
        .set 'Authorization', token
        .send siteData
        .expect 'Content-Type', /json/
        .end done
    it "adds a site to the database", (done) ->
      request app
        .post '/api/divesites'
        .set 'Authorization', token
        .send siteData
        .end (err, res) ->
          Divesite.find {where: {name: "TEST_SITE"}}, (err, sites) ->
            expect(sites).to.have.length 1
            done err
    it "sets the authenticated user as the creator of the new site", (done) ->
      request app
        .post "/api/divesites"
        .set "Authorization", token
        .send siteData
        .end (err, res) ->
          Divesite.findOne {where: {name: "TEST_SITE"}}, (err, site) ->
            expect(site.userId).to.equal userId
            done err
    it "overrides a 'userId' key in the submitted site data", (done) ->
      bogusSiteData = JSON.parse JSON.stringify siteData
      bogusSiteData.userId = userId + 1
      request app
        .post "/api/divesites"
        .set "Authorization", token
        .send bogusSiteData
        .end (err, res) ->
          Divesite.findOne {where: {name: "TEST_SITE"}}, (err, site) ->
            expect(site.userId).to.equal userId
            done err
    it "works OK with the kind of data that the Angular front-end sends", (done) ->
      request app
        .post "/api/divesites"
        .set "Authorization", token
        .send {
          boatEntry: false
          depth: 10
          loc:
            lat: 51.68744595275606
            lng: -8.456608963012737
          minimumLevel: "0"
          name: "Ballymaccus Bay"
          shoreEntry: true
          description: "A decent training site but not much to see."
        }
        .expect HTTP.OK
        .end (err, res) ->
          Divesite.find {where: {name: "Ballymaccus Bay"}}, (err, sites) ->
            expect(sites).to.have.length 1
            done err
