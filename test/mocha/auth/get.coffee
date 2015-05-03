process.env.NODE_ENV = 'test' 

assert = require('assert')
async = require 'async'
should = require('should')
mongoose = require('mongoose')
express = require('express')
request = require('supertest')
HTTP = require('http-status-codes')

routes = require.main.require('routes/index')
Divesite = require.main.require('models/Divesite')
User = require.main.require('models/User')
app = require.main.require('app')

describe "GET /auth/profile", () ->

  beforeEach (done) ->
    async.series [
      (cb) -> User.find().remove(cb)
      (cb) -> User.create({
        displayName: 'TEST_USER'
        picture: 'http://example.com/example.png'
      }, cb)
    ], done

  afterEach (done) -> User.find().remove(done)

  describe "without authorization", () ->
    it "returns HTTP 401", (done) ->
      request app
        .get '/auth/profile'
        .expect HTTP.UNAUTHORIZED
        .end done

  describe "with authorization", () ->
    it "returns HTTP 200", (done) -> 
      async.waterfall [
        (cb) -> User.findOne({displayName: 'TEST_USER'}, cb)
        (user, cb) -> 
          request app
            .get '/auth/profile'
            .set 'force-authenticate', true
            .set 'auth-id', "" + user._id
            .expect HTTP.OK
            .end cb
        (res, cb) ->
          res.body.should.be.an.Object
          res.body.should.not.be.empty
          res.body.should.have.properties ['displayName', 'picture']
          should(res.body.displayName).equal 'TEST_USER'
          cb()
      ], done
