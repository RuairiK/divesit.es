process.env.NODE_ENV = 'test'

async = require 'async'
assert = require('assert')
should = require('should')
mongoose = require('mongoose')
express = require('express')
HTTP = require('http-status-codes')
request = require('supertest')

routes = require('../../../routes/index')
Divesite = require('../../../models/Divesite')
User = require('../../../models/User')
app = require('../../../app')
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
    makeRequest = () ->
      request app
        .post '/divesites'
        .set 'force-authenticate', true

    it "returns HTTP 201", (done) -> async.waterfall [
      (cb) -> User.findOne cb
      (user, cb) ->
        makeRequest()
          .set 'auth-id', user._id
          .send siteData
          .expect HTTP.CREATED
          .end cb
    ], done

    it "returns JSON", (done) -> async.waterfall [
      (cb) -> User.findOne cb
      (user, cb) ->
        makeRequest()
          .set 'auth-id', user._id
          .send siteData
          .expect 'Content-Type', /json/
          .end cb
    ], done

    it "adds a dive site to the database", (done) -> async.waterfall [
      (cb) -> User.findOne cb
      (user, cb) ->
        makeRequest()
          .set 'auth-id', user._id
          .send siteData
          .end (e, r) -> cb(e, user)
      (user, cb) -> Divesite.findOne {name: siteData.name}, (e, site) -> cb(e, user, site)
      (user, site, cb) ->
        site.should.be.an.Object
        site.should.have.properties ['creator_id', '_id', 'name', 'category', 'loc', 'updated_at']
        site.loc.should.be.an.Array
        site.loc.should.have.length 2
        should.equal site.name, siteData.name
        should.equal "" + site.creator_id, "" + user._id
        cb()
    ], done
