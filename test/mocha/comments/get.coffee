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

describe "GET /comments/", ->
  it "returns HTTP 404", (done) ->
    request app
      .get '/comments/'
      .expect HTTP.NOT_FOUND
      .end done

describe "GET /comments/:id", ->
  beforeEach (done) ->
    async.series [
      (cb) -> utils.createSiteAndUser cb
      (cb) -> utils.createComment cb
    ], done
  afterEach utils.tearDown

  it "returns HTTP 200 and a comment if given a valid comment ID", (done) ->
    async.waterfall [
      (cb) -> Comment.findOne(cb)
      (comment, cb) ->
        request app
          .get "/comments/#{comment._id}/"
          .expect HTTP.OK
          .end (e, res) -> cb(e, comment, res)
      (comment, res, cb) ->
        res.body.should.be.an.Object
        res.body.should.have.properties ['_id', 'user', 'text']
        should.equal "" + res.body._id, "" + comment._id
        res.body.text.should.equal comment.text
        should.equal "" + res.body.user._id, "" + comment.user._id
        cb()
    ], done
  it "returns HTTP 404 if given an invalid comment ID", (done) ->
    request app
      .get '/comments/bogus/'
      .expect HTTP.NOT_FOUND
      .end done
  it "returns HTTP 404 if given a valid comment ID with no match", (done) ->
    s = new Comment()
    request app
      .get "/comments/#{s._id}"
      .expect HTTP.NOT_FOUND
      .end done

describe "GET /divesites/:id/comments", () ->
  beforeEach (done) ->
    async.series [
      (cb) -> utils.createSiteAndUser cb
      (cb) -> utils.createComment cb
    ], done
  afterEach utils.tearDown

  describe "if given a valid site ID", () ->
    describe "if there are comments", () ->
      it "returns HTTP 200 and a non-empty list", (done) ->
        async.waterfall [
          (cb) -> Divesite.findOne(cb)
          (site, cb) -> 
            request app
              .get "/divesites/#{site._id}/comments"
              .expect HTTP.OK
              .end cb
          (res, cb) ->
            res.body.should.be.an.Array
            res.body.should.have.length 1
            res.body[0].should.have.properties ['_id', 'divesite_id', 'user',
              'text', 'updated_at', 'created_at']
            res.body[0].user.should.have.properties ['_id', 'displayName', 'picture']
            cb()
        ], done
    describe "if there are no comments", () ->
      beforeEach utils.destroyAllComments
      it "returns HTTP 200 and an empty list", (done) ->
        async.waterfall [
          (cb) -> Divesite.findOne cb
          (site, cb) ->
            request app
              .get "/divesites/#{site._id}/comments"
              .expect HTTP.OK
              .end cb
          (res, cb) ->
            res.body.should.be.an.Array
            res.body.should.be.empty
            cb()
        ], done
    
  it "returns HTTP 404 if given an invalid ID", (done) ->
    request app
      .get '/divesites/invalid_id/comments'
      .expect HTTP.NOT_FOUND
      .end done

  it "returns HTTP 404 if given a valid ID not in the db", (done) ->
    s = new Divesite
    request app
      .get "/divesites/#{s._id}/"
      .expect HTTP.NOT_FOUND
      .end done
