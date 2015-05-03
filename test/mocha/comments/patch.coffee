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
Comment = require.main.require('models/Comment')
app = require.main.require('app')

utils = require('../utils')

describe "PATCH /comments/:id", () ->
  beforeEach utils.createSiteAndUser
  afterEach utils.tearDown

  beforeEach utils.createComment
  afterEach utils.destroyAllComments

  describe "without authorization", () ->
    it "returns HTTP 401 without updating the comment", (done) ->
      async.waterfall [
        (cb) -> Comment.findOne cb
        (comment, cb) ->
          newText = "NEW_TEXT"
          request app
            .patch "/comments/#{comment._id}"
            .send {text: newText}
            .expect HTTP.UNAUTHORIZED
            .end (err, res) -> cb(err, comment)
        (original, cb) ->
          Comment.findOne (err, updated) -> cb(err, original, updated)
        (original, updated, cb) ->
          original.text.should.equal updated.text
          cb()
      ], done

  describe "with authorization", () ->
    describe "with a valid comment ID", () ->
      describe "as the comment's creator", () ->
        it "returns HTTP 200 with the updated comment", (done) ->
          async.waterfall [
            (cb) -> Comment.findOne cb
            (comment, cb) ->
              request app
                .patch "/comments/#{comment._id}"
                .set 'force-authenticate', true
                .set 'auth-id', comment.user._id
                .send {text: 'NEW_TEXT'}
                .expect HTTP.OK
                .expect 'Content-Type', /json/
                .end cb
            (res, cb) ->
              res.body.should.be.an.Object
              res.body.should.not.be.Empty
              res.body.text.should.be.equal "NEW_TEXT"
              cb()
          ], done
      describe "as another user", () ->
        it "returns HTTP 403 and does not update the comment", (done) ->
          async.waterfall [
            (cb) -> Comment.findOne cb
            (comment, cb) ->
              User.create {displayName: "USER_2"}, (err, user) -> cb(err, user, comment)
            (user, comment, cb) ->
              request app
                .patch "/comments/#{comment._id}/"
                .set 'force-authenticate', true
                .set 'auth-id', user._id
                .send {text: 'foo bar boz'}
                .expect HTTP.FORBIDDEN
                .end (err, res) -> cb(err, comment)
            (original, cb) -> 
              Comment.findOne (err, updated) -> cb(err, original, updated)
            (original, updated, cb) ->
              original.text.should.equal updated.text
              cb()
          ], done
    it "returns HTTP 404 if given a valid ID with no match in the database", (done) ->
      c = new Comment
      async.waterfall [
        (cb) -> User.findOne cb
        (user, cb) ->
          request app
            .patch "/comments/#{c._id}/"
            .set 'force-authenticate', true
            .set 'auth-id', user._id
            .expect HTTP.NOT_FOUND
            .end cb
      ], done
    it "returns HTTP 404 if given an invalid ID", (done) ->
      async.waterfall [
        (cb) -> User.findOne cb
        (user, cb) ->
          request app
            .patch "/comments/invalid_id/"
            .set 'force-authenticate', true
            .set 'auth-id', user._id
            .expect HTTP.NOT_FOUND
            .end cb
      ], done
