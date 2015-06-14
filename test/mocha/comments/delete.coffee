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

describe "DELETE /comments/:id", () ->
  before utils.createSiteAndUser
  after utils.tearDown
  beforeEach utils.createComment
  afterEach utils.destroyAllComments

  describe "without authorization", () ->
    it "returns HTTP 401 and doesn't delete the comment", (done) ->
      async.waterfall [
        (cb) -> Comment.findOne cb
        (comment, cb) ->
          request app
            .delete "/comments/#{comment._id}"
            .expect HTTP.UNAUTHORIZED
            .end (err, res) -> cb(err, comment)
        (original, cb) ->
          Comment.findOne (err, updated) -> cb(err, original, updated)
        (original, updated, cb) ->
          should(updated).not.be.null
          updated.text.should.equal original.text
          cb()
      ], done
  describe "with authorization", () ->
    describe "if given a valid comment ID", () ->
      describe "as the comment's creator", () ->
        it "deletes the comment and returns HTTP 204", (done) ->
          async.waterfall [
            (cb) -> Comment.findOne cb
            (comment, cb) ->
              request app
                .delete "/comments/#{comment._id}"
                .set 'force-authenticate', true
                .set 'auth-id', "" + comment.user._id
                .expect HTTP.NO_CONTENT
                .end (e, res) -> cb(e, comment)
            (original, cb) ->
              Comment.findOne {_id: original._id}, cb
            (updated, cb) ->
              should(updated).be.null
              cb()
          ], done
      describe "as another user", () ->
        beforeEach (done) ->
          User.create {displayName: 'A. N. OTHER', picture: 'http://example.com/example.png'}, done
        afterEach (done) -> User.find({displayName: 'A. N. OTHER'}).remove done
        it "returns HTTP 403 and doesn't delete the comment", (done) ->
          async.waterfall [
            (cb) -> User.findOne {displayName: 'A. N. OTHER'}, cb
            (user, cb) -> Comment.findOne (e, c) -> cb(e, user, c)
            (user, comment, cb) -> 
              request app
                .delete "/comments/#{comment._id}"
                .set 'force-authenticate', true
                .set 'auth-id', user._id
                .expect HTTP.FORBIDDEN
                .end (e, r) -> cb(e, comment)
            (comment, cb) -> Comment.findOne {_id: comment._id}, (e, c) -> cb(e, comment, c)
            (original, updated, cb) ->
              should(updated).not.be.null
              cb()
          ], done
    it "returns HTTP 404 if given an invalid comment ID", (done) ->
      async.waterfall [
        (cb) -> User.findOne cb
        (user, cb) ->
          request app
            .delete "/comments/invalid_id/"
            .set 'force-authenticate', true
            .set 'auth-id', user._id
            .expect HTTP.NOT_FOUND
            .end cb
      ], done

    it "returns HTTP 404 if given a comment ID with no match", (done) ->
      c = new Comment
      async.waterfall [
        (cb) -> User.findOne cb
        (user, cb) ->
          request app
            .delete "/comments/#{c._id}/"
            .set 'force-authenticate', true
            .set 'auth-id', user._id
            .expect HTTP.NOT_FOUND
            .end cb
      ], done
