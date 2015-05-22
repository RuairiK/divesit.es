process.env.NODE_ENV = 'test' 

assert = require('assert')
async = require 'async'
should = require('should')
mongoose = require('mongoose')
express = require('express')
request = require('supertest')
HTTP = require('http-status-codes')

routes = require '../../../routes/index'
Divesite = require '../../../models/Divesite'
User = require '../../../models/User'
app = require '../../../app'
utils = require '../utils'

describe "POST /auth/profile", () -> 
  describe "without authorization", () ->
    it "returns HTTP 401", (done) ->
      request app
        .post '/auth/profile'
        .expect HTTP.UNAUTHORIZED
        .end done

  describe "with authorization", () ->
    beforeEach (done) ->
      async.series [
        (cb) -> User.find().remove(cb)
        (cb) -> utils.createUser(cb)
      ], done
    afterEach (done) -> User.find().remove(done)
    
    it "returns HTTP 405", (done) -> async.waterfall [
      (cb) -> User.findOne(cb)
      (user, cb) ->
        request app
          .post '/auth/profile'
          .set 'force-authenticate', true
          .set 'auth-id', user._id
          .expect HTTP.METHOD_NOT_ALLOWED
          .end cb
    ], done
