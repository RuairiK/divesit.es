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
Comment = require('../../../models/Comment')
app = require('../../../app')

utils = require('../utils')

describe "POST/comments/", () ->
  beforeEach utils.createUser
  afterEach utils.tearDown

  it "returns HTTP 401 without authorization", (done) ->
    request app
      .post '/comments/'
      .send {text: 'blah'}
      .expect HTTP.UNAUTHORIZED
      .end done
  it "returns HTTP 405 with authorization", (done) ->
    async.waterfall [
      (cb) -> User.findOne cb
      (user, cb) ->
        request app
          .post '/comments/'
          .set 'force-authenticate', true
          .set 'auth-id', user._id
          .expect HTTP.METHOD_NOT_ALLOWED
          .end cb
    ], done


describe "POST/divesites/:id/comments", () ->
  beforeEach utils.createSiteAndUser
  afterEach utils.tearDown

  describe "without authorization", () ->
    it "returns HTTP 401 and doesn't add a comment", (done) ->
      async.waterfall [
        (cb) -> Divesite.findOne cb 
        (site, cb) ->
          request app
            .post "/divesites/#{site._id}/comments"
            .send {text: 'blah'}
            .expect HTTP.UNAUTHORIZED
            .end cb
        (_, cb) -> Comment.find(cb)
        (res, cb) ->
          res.should.have.length 0
          cb()
      ], done

  describe "with authorization", () ->
    it "returns HTTP 400 if given an invalid site ID", (done) ->
      async.waterfall [
        (cb) -> User.findOne cb
        (user, cb) ->
          request app
            .post "/divesites/invalid/comments"
            .set 'force-authenticate', true
            .set 'auth-id', user._id
            .expect HTTP.BAD_REQUEST
            .end done
      ], done
    it "returns HTTP 400 if given a valid but unmatchable site ID", (done) ->
      async.waterfall [
        (cb) -> User.findOne cb
        (user, cb) ->
          s = new Divesite
          request app
            .post "/divesites/#{s._id}/comments"
            .set 'force-authenticate', true
            .set 'auth-id', user._id
            .expect HTTP.BAD_REQUEST
            .end cb
      ], done
      
    describe "with a valid site ID", () ->
      it "adds a comment to the database and returns HTTP 201 and the new comment", (done) ->
        async.waterfall [
          (cb) -> User.findOne cb
          (user, cb) -> Divesite.findOne (err, site) -> cb(err, site, user)
          (site, user, cb) ->
            request app
              .post "/divesites/#{site._id}/comments"
              .set 'force-authenticate', true
              .set 'auth-id', user._id
              .send {text: 'blah blah blah'}
              .expect HTTP.CREATED
              .end cb
          (res, cb) ->
            res.body.should.be.an.Object
            res.body.should.not.be.empty
            res.body.text.should.equal 'blah blah blah'
            Comment.find cb
          (res, cb) ->
            res.length.should.equal 1
            cb()
        ], done
