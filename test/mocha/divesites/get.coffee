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

describe "GET /divesites", () ->
  before () ->
    [1, 2, 3].forEach (i) -> Divesite.create {
      name: 'TEST_SITE_' + i
      category: 'wreck'
      chart_depth: 100
      loc: [i, i]
    }
  after utils.tearDown

  it "returns HTTP 200 and a list of objects", (done) ->
    request app
      .get '/divesites'
      .expect HTTP.OK
      .expect 'Content-Type', /json/
      .end (err, res) ->
        res.body.should.be.an.Array # response type ok
        res.body.length.should.equal 3 # correct length
        res.body.forEach (o) -> # check each element
          o.should.be.an.Object 
          o.should.have.properties ['name', '_id', 'category', 'loc', 'chart_depth']
        done()

describe 'GET /divesites/:id', () ->
  before () ->
    [1, 2, 3].forEach (i) -> Divesite.create {
      name: 'TEST_SITE_' + i
      category: 'wreck'
      chart_depth: 100
      loc: [i, i]
    }
  after utils.tearDown

  describe "with a valid site ID", () ->
    it "returns HTTP 200 and a JSON object", (done) ->
      async.waterfall [
        (cb) -> Divesite.findOne cb
        (site, cb) ->
          request app
            .get "/divesites/#{site._id}"
            .expect HTTP.OK
            .expect 'Content-Type', /json/
            .end cb
        (res, cb) ->
          res.body.should.be.an.Object
          res.body.should.have.properties ['name', '_id', 'loc', 'category', 'chart_depth']
          res.body.loc.should.be.an.Array
          res.body.loc.length.should.equal 2
          res.body.loc[0].should.be.a.Number
          res.body.loc[1].should.be.a.Number
          cb()
      ], done
  describe "with a valid site ID that matches nothing", () ->
    it "returns HTTP 404", (done) ->
      site = new Divesite
      async.waterfall [
        (cb) ->
          request app
            .get "/divesites/#{site._id}"
            .expect HTTP.NOT_FOUND
            .expect 'Content-Type', /json/
            .end cb
        (res, cb) ->
          res.body.should.be.empty
          cb()
      ], done
  describe "with an invalid site ID", () ->
    it "returns HTTP 404", (done) ->
      async.waterfall [
        (cb) ->
          request app
            .get "/divesites/invalid/"
            .expect HTTP.NOT_FOUND
            .expect 'Content-Type', /json/
            .end cb
        (res, cb) ->
          res.body.should.be.empty
          cb()
      ], done
