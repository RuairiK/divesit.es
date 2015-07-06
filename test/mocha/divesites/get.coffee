async = require 'async'
assert = require 'assert'
HTTP = require 'http-status-codes'
request = require 'supertest'
expect = require('chai').expect

app = require '../../../server/server'
utils = require '../utils'
Divesite = app.models.Divesite


describe "GET /api/divesites", ->

  before utils.createSites
  after utils.tearDown

  req = {}
  beforeEach ->
    req = request app
      .get '/api/divesites'

  it "returns HTTP 200", (done) ->
    req
      .expect HTTP.OK
      .end done
  
  it "returns JSON", (done) ->
    req
      .expect 'Content-Type', /json/
      .end done

  it "returns an Array", (done) ->
    req.end (err, res) ->
      expect(res.body).to.be.an.Array
      expect(res.body).to.have.length 3
      done err

describe "GET /api/divesites/:id", ->

  before utils.createOwnedSite
  after utils.tearDown

  site = {}
  beforeEach (done) ->
    Divesite.findOne {where: {name: "Test Divesite"}}, (err, res) ->
      site = res
      done err

  describe "with a valid site ID", ->
    it "returns HTTP 200 and JSON", (done) ->
      request app
        .get "/api/divesites/#{site.id}"
        .expect HTTP.OK
        .expect 'Content-Type', /json/
        .end done
    it "returns the expected fields", (done) ->
      request app
        .get "/api/divesites/#{site.id}"
        .end (err, res) ->
          site = res.body
          expect(res.body).to.be.an.Object
          expect(res.body).to.have.property "name", "Test Divesite"
          expect(res.body).to.have.property "user"
          expect(res.body.user).to.have.property "email"
          expect(res.body.user).to.have.property "id"
          expect(res.body.user).to.have.property "displayName"
          done err

  describe "with an invalid site ID", ->
    invalidId = {}
    beforeEach (done) ->
      Divesite.find (err, sites) ->
        ids = (site.id for site in sites)
        invalidId = ids.sort().reverse()[0] + 1
        done err
    it "returns HTTP 404", (done) ->
      request app
        .get "/api/divesites/#{invalidId}"
        .expect HTTP.NOT_FOUND
        .end done
