process.env.NODE_ENV = 'test'; 

var assert = require('assert');
var should = require('should');
var mongoose = require('mongoose');
var express = require('express');
var HTTP = require('http-status-codes');
var request = require('supertest');

var routes = require.main.require('routes/index');
var Divesite = require.main.require('models/Divesite');
var User = require.main.require('models/User');
var Comment = require.main.require('models/Comment');
var app = require.main.require('app');

var beforeAll = require('./utils').createSiteAndUser;
var tearDown = require('./utils').tearDown;
var createComment = require('./utils').createComment;
var destroyAllComments = require('./utils').destroyAllComments;
var utils = require('./utils');

describe("DELETE /comments/:id", function () {
  before(beforeAll);
  after(tearDown);
  describe("without authorization", function () {
    beforeEach(createComment);
    afterEach(destroyAllComments);
    it("returns HTTP 401 and doesn't delete the comment", function (done) {
      Comment.findOne(function (err, comment) {
        if (err) return done(err);
        var _id = comment._id;
        request(app)
        .delete('/comments/' + _id)
        .expect(HTTP.UNAUTHORIZED)
        .end(function (err, res) {
          if (err) return done(err);
          res.body.should.be.an.Object;
          Comment.findOne({_id: _id}, function (err, undeletedComment) {
            should(undeletedComment).not.be.null;
            done();
          });
        });
      });
    });
  });

  describe("with authorization", function () {
    describe("with a valid comment ID", function () {
      beforeEach(createComment);
      afterEach(destroyAllComments);

      describe("if authenticated as the comment's creator", function () {
        it("returns HTTP 204 and deletes the comment", function (done) {
          User.findOne({displayName: utils.USERNAME}, function (err, user) {
            Comment.findOne(function (err, comment) {
              if (err) return done(err);
              var _id = comment._id;
              request(app)
              .delete('/comments/' + _id)
              .set('force-authenticate', true)
              .set('auth-id', user._id)
              .expect(HTTP.NO_CONTENT)
              .end(function (err, res) {
                if (err) return done(err);
                res.body.should.be.an.Object;
                res.body.should.be.empty;
                Comment.findOne({_id: _id}, function (err, deletedComment) {
                  should(deletedComment).be.null;
                  done();
                });
              });
            });
          });
        });
      });

      describe("if authenticated as another user", function () {
        beforeEach(function (done) {
          User.create({displayName: 'OTHER_USER', picture: 'http://example.com/example.png'}, done);
        });
        afterEach(function (done) {
          User.find({displayName: 'OTHER_USER'}).remove(done);
        });

        it("returns HTTP 403 and doesn't delete the comment", function (done) {
          User.findOne({displayName: 'OTHER_USER'}, function (err, user) {
            if (err) return done(err);
            Comment.findOne(function (err, comment) {
              if (err) return done(err);
              var _id = comment._id;
              request(app)
              .delete('/comments/' + _id)
              .set('force-authenticate', true)
              .set('auth-id', user._id)
              .expect(HTTP.FORBIDDEN)
              .end(function (err, res) {
                if (err) return done(err);
                res.body.should.be.an.Object;
                Comment.findOne({_id: _id}, function (err, deletedComment) {
                  should(deletedComment).not.be.null;
                  done();
                });
              });
            });
          });
        });
      });

    });
  });
});
