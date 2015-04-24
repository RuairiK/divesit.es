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

var tearDown = require('./utils').tearDown;
var beforeAll = require('./utils').createSiteAndUser;

describe("POST /divesites/:id/comments", function () {
  var TEST_USER, TEST_DIVESITE, NUM_COMMENTS;

  before(beforeAll);
  after(tearDown);

  afterEach(function (done) {
    Comment.find().remove(done);
  });

  describe("without authorization", function () {
    it("returns HTTP 401", function (done) {
      Divesite.findOne(function (err, site) {
        if (err) return done(err);
        User.findOne(function(err, user) {
          if (err) return done(err);
          request(app)
          .post('/divesites/' + site._id + '/comments')
          .send({text: 'blah blah', user_id: user._id})
          .expect(HTTP.UNAUTHORIZED)
          .end(done);
        });
      });
    });

    it("doesn't add a comment to the database", function (done) {
      Divesite.findOne(function (err, site) {
        if (err) return done(err);
        User.findOne(function(err, user) {
          if (err) return done(err);
          request(app)
          .post('/divesites/' + site._id + '/comments')
          .send({text: 'blah blah', user_id: user._id})
          .end(function (err, res) {
            if (err) return done(err);
            Comment.find(function (err, res) {
              if (err) return done(err);
              res.length.should.equal(0); // should be empty
            });
            done();
          });
        });
      });
    });
  });

  describe("with authorization", function () {

    it("returns HTTP 201 and an object", function (done) {
      Divesite.findOne(function (err, site) {
        if (err) return done(err);
        User.findOne(function(err, user) {
          if (err) return done(err);
          request(app)
          .post('/divesites/' + site._id + '/comments')
          .set('force-authenticate', true)
          .set('auth-id', user._id)
          .send({text: 'blah blah'})
          .end(function (err, res) {
            if (err) return done(err);
            res.body.should.be.an.Object;
            res.body.should.have.properties('_id', 'user', 'created_at', 'updated_at', 'text');
            res.body.user.should.have.properties(['_id', 'displayName', 'picture']);
            done();
          });
        });
      });
    });

    it("adds a comment to the database", function (done) {
      Divesite.findOne(function (err, site) {
        if (err) return done(err);
        User.findOne(function(err, user) {
          if (err) return done(err);
          request(app)
          .post('/divesites/' + site._id + '/comments')
          .set('force-authenticate', true)
          .set('auth-id', user._id)
          .send({text: 'blah blah'})
          .expect(HTTP.CREATED)
          .end(function (err, res) {
            if (err) return done(err);
            Comment.find(function (err, res) {
              if (err) return done(err);
              res.length.should.equal(1);
            });
            done();
          });
        });
      });
    });
  });

});

describe("POST /comments/", function () {
  var NUM_COMMENTS;
  before(function (done) {
    Comment.find().count(function (err, count) {
      if (err) return done(err);
      NUM_COMMENTS = count;
      done();
    });
  });

  it("returns HTTP 405", function (done) {
    request(app)
    .post('/comments/')
    .send({})
    .expect(HTTP.METHOD_NOT_ALLOWED)
    .end(done);
  });

  it("doesn't add a new comment to the database", function (done) {
    request(app)
    .post('/comments/')
    .send({})
    .end(function (err, res) {
      Comment.find().count(function (err, count) {
        should.equal(count, NUM_COMMENTS);
        done();
      });
    });
  });
});
