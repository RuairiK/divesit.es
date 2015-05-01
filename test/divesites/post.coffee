process.env.NODE_ENV = 'test'

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
  before (done) -> User.create {displayName: 'TEST_USER'}, done
  after (done) -> User.find().remove done

  afterEach (done) -> Divesite.find().remove done

  describe "without authorization", () ->
    it "returns HTTP 401", (done) ->
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
    it "adds a new dive site", (done) ->
      User.findOne {displayName: 'TEST_USER'}, (err, user) ->
        request app
          .post '/divesites'
          .set 'force-authenticate', true
          .set 'auth-id', user._id
          .send siteData
          .expect HTTP.CREATED
          .expect 'Content-type', /json/
          .end (err, res) ->
            # The new site is returned in the response
            res.body.should.be.an.Object
            res.body.should.have.properties ['_id', 'name', 'category', 'loc', 'chart_depth']
            # Confirm that the new site is in the database
            Divesite.findOne {name: siteData.name}, (err, newSite) ->
              newSite.should.be.an.Object
              newSite.should.have.properties ['_id', 'name', 'category', 'loc', 'updated_at']
              newSite.loc.should.be.an.Array
              newSite.loc.should.have.length 2
              done()
