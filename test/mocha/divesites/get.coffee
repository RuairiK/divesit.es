async = require 'async'
assert = require 'assert'
should = require 'should'
HTTP = require 'http-status-codes'
request = require 'supertest'

app = require '../../../server/server'
Divesite = app.models.Divesite

createSites = (done) ->
  async.parallel [
    (cb) -> Divesite.create {
      name: 'SITE_1',
      boatEntry: true,
      shoreEntry: false,
      depth: 10,
      loc: [1, 1],
      minimumLevel: 0
      description: 'SITE_1 DESCRIPTION'
    }, cb
    (cb) -> Divesite.create {
      name: 'SITE_2',
      boatEntry: false,
      shoreEntry: true,
      depth: 20,
      loc: [2, 2]
      minimumLevel: 1
      description: 'SITE_2 DESCRIPTION'
    }, cb
    (cb) -> Divesite.create {
      name: 'SITE_3',
      boatEntry: true,
      shoreEntry: true,
      depth: 30,
      loc: [3, 3]
      minimumLevel: 2
      description: 'SITE_3 DESCRIPTION'
    }, cb
  ], done

describe "GET /divesites", ->

  before (done) -> createSites done
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

  before (done) -> createSites done
  after (done) -> Divesite.destroyAll done

  describe "with a valid site ID", ->
    it "returns HTTP 200 and JSON", (done) ->
      async.waterfall [
        (cb) -> Divesite.findOne cb
        (site, cb) ->
          request app
            .get "/api/divesites/#{site.id}"
            .expect HTTP.OK
            .expect 'Content-Type', /json/
            .end done
      ], done
