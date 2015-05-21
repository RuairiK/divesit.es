process.env.NODE_ENV = 'test'

async = require 'async'
assert = require('assert')
should = require('should')
mongoose = require('mongoose')
express = require('express')
HTTP = require('http-status-codes')
request = require('supertest')

routes = require.main.require('routes/index')
Divesite = require.main.require('models/Divesite')
User = require.main.require('models/User')
app = require.main.require('app')
utils = require('../utils')

siteData =
  name: "TEST_SITE"
  category: "wreck"
  depth: 100
  coords:
    longitude: 0
    latitude: 0


describe "POST /divesites", () ->
  before utils.createUser
  after utils.tearDown

  afterEach (done) -> Divesite.find().remove done

  describe "without authorization", () ->
    it "returns HTTP 401 and doesn't add a new site", (done) ->
      request app
        .post '/divesites'
        .expect 'Content-type', /json/
        .expect HTTP.UNAUTHORIZED
        .end (err, res) ->
          # Check that there's nothing in the db
          Divesite.find (err, res) ->
            res.should.be.an.Array
            res.should.be.empty
            done()

  describe "with authorization", () ->
    it "adds a new dive site and returns 201", (done) ->
      async.waterfall [
        (cb) -> User.findOne cb
        (user, cb) -> 
          request app
            .post '/divesites'
            .set 'force-authenticate', true
            .set 'auth-id', user._id
            .send siteData
            .expect HTTP.CREATED
            .expect 'Content-type', /json/
            .end cb
        (res, cb) ->
          res.body.should.be.an.Object
          res.body.should.have.properties ['_id', 'name', 'category', 'loc', 'chart_depth']
          Divesite.findOne {name: siteData.name}, cb
        (site, cb) ->
          site.should.be.an.Object
          site.should.have.properties ['_id', 'name', 'category', 'loc', 'updated_at']
          site.loc.should.be.an.Array
          site.loc.should.have.length 2
          cb()
      ], done
