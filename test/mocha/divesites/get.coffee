async = require 'async'
assert = require 'assert'
should = require 'should'
HTTP = require 'http-status-codes'
request = require 'supertest'

app = require '../../../server/server'
utils = require '../utils'
Divesite = app.models.Divesite


describe "GET /divesites", ->

  before (done) -> utils.createSites done
  after (done) -> Divesite.destroyAll done

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

  it "returns a list of 3 sites", (done) ->
    req
      .end (err, res) ->
        #res.should.be.an.Array
        done()
        #res.should.have.length 3

describe "GET /divesites/:id", ->

  before (done) -> utils.createSites done
  after (done) -> Divesite.destroyAll done

  site = {}
  beforeEach (done) ->
    Divesite.findOne {where: {name: "SITE_1"}}, (err, res) ->
      site = res
      done err

  describe "with a valid site ID", ->
    it "returns HTTP 200 and JSON", (done) ->
      request app
        .get "/api/divesites/#{site.id}"
        .expect HTTP.OK
        .expect 'Content-Type', /json/
        .end done

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
