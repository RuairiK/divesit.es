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

var utils = require('../utils');
var beforeAll = utils.createSiteAndUser;
var tearDown = utils.tearDown;
var createComment = utils.createComment;
var destroyAllComments = utils.destroyAllComments;

function createComment(done) {
  // Before each test, create a comment
  Divesite.findOne(function (err, site) {
    User.findOne({displayName: utils.USERNAME}, function (err, user) {
      if (err) return done(err);
      var userObj = { _id: user._id, picture: user.picture, displayName: user.displayName };
      var comment = { divesite_id: site._id, user: userObj, text: "blah blah blah" };
      Comment.create(comment, function (err, comment) {
        if (err) {return done(err);}
        done();
      });
    });
  });
}

describe("PATCH /comments/:id", function () {

  before(beforeAll);
  before(function (done) {
    // Create a second user
    User.create({displayName: 'TEST_USER_2', picture: 'http://example.com/example.png'}, function (err, user) {
      done();
    });
  });

  after(function () {
    // Tear down suite
    User.find().remove().exec();
    Divesite.find().remove().exec();
    Comment.find().remove().exec();
  });

  beforeEach(createComment);

  afterEach(destroyAllComments);

  describe("without authorization", function () {
    it("returns HTTP 401 without altering the comment", function (done) {
      Comment.findOne(function (err, comment) {
        var oldText = comment.text;
        if (err) return done(err);
        request(app)
        .patch('/comments/' + comment._id)
        .send({'text': 'Foo bar boz'})
        .expect(HTTP.UNAUTHORIZED)
        .end(function (err, res) {
          if (err) return done(err);
          Comment.findOne({_id: comment._id}, function (err, newComment) {
            newComment.text.should.be.equal(oldText);
            done();
          });
        });
      });
    });
  });


  describe("when authenticated", function () {
    describe("with a valid comment ID", function () {
      describe("as the comment's creator", function () {
        it("updates the database and returns HTTP 200 with a JSON object", function (done) {
          var newText = "foo bar boz";
          Comment.findOne(function (err, comment) {
            if (err) return done(err);
            request(app)
            .patch('/comments/' + comment._id)
            .set('Force-Authenticate', true)
            .set('Auth-ID', comment.user._id)
            .send({'text': newText})
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
              if (err) return done(err);
              res.body.should.be.an.Object;
              res.body.should.not.be.empty;
              res.body.text.should.be.equal(newText);
              res.body.text.should.not.be.equal(comment.text);
              done();
            });
          });
        });
      });
      describe("as another user", function () {
        var newText = "foo bar boz";
        it("returns HTTP 403 and doesn't update the comment text", function (done) {
          Comment.findOne(function (err, comment) {
            var oldText = comment.text;
            User.findOne({displayName: "TEST_USER_2"}, function (err, user) {
              if (err) return done(err);
              request(app)
              .patch('/comments/' + comment._id)
              .set('Force-Authenticate', true)
              .set('Auth-ID', user._id)
              .send({text: newText})
              .expect(HTTP.FORBIDDEN)
              .end(function (err, res) {
                Comment.findOne({_id: comment._id}, function (err, newComment) {
                  // Comment in db
                  newComment.text.should.be.equal(oldText);
                  newComment.text.should.not.be.equal(newText);
                  done();
                });
              });
            });
          });
        });
      });
    });

    describe("with an invalid comment ID", function () {
      it("returns HTTP 404 and an empty object", function (done) {
        User.findOne(function (err, user) {
          if (err) return done(err);
          request(app)
          .patch("/comments/invalid_id")
          .set('Force-Authenticate', true)
          .set('Auth-ID', user._id)
          .send({text: 'foo bar boz'})
          .expect(404)
          .expect('Content-Type', /json/)
          .end(function (err, res) {
            if (err) return done(err);
            res.body.should.be.an.Object;
            res.body.should.be.empty;
            done();
          });
        });
      });
    });

    describe("with a valid comment ID but no match in the database", function () {
      it("returns HTTP 404 and an empty object", function (done) {
        User.findOne(function (err, user) {
          // Instantiate but don't save a comment
          var c = new Comment();
          request(app)
          .patch("/comments/" + c._id)
          .set('Force-Authenticate', true)
          .set('Auth-ID', user._id)
          .send({text: 'foo bar boz'})
          .expect(HTTP.NOT_FOUND)
          .expect('Content-Type', /json/)
          .end(function (err, res) {
            if (err) return done(err);
            res.body.should.be.an.Object;
            res.body.should.be.empty;
            done();
          });
        });
      });
    });
  });
});
