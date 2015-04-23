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


describe("POST /divesites/:id/comments", function () {
  var TEST_USER, TEST_DIVESITE, NUM_COMMENTS;
  before(function (done) {
    Divesite.create({name: "TEST_DIVESITE"}, function (err, site) {
      TEST_DIVESITE = site;
      User.create({displayName: 'TEST_USER', picture: 'http://example.com/example.png'}, function (err, user) {
        TEST_USER = user;
        Comment.find(function (err, comments) {
          NUM_COMMENTS = comments.length;
          done();
        });
      });
    });
  });

  after(function () {
    User.find({displayName: 'TEST_USER'}).remove().exec();
    Divesite.find({name: "TEST_DIVESITE"}).remove().exec();
    Comment.find().remove().exec();
  });

  afterEach(function (done) {
    Comment.find().remove(done);
  });

  describe("without authorization", function () {
    it("returns HTTP 401", function (done) {
        request(app)
        .post('/divesites/' + TEST_DIVESITE._id + '/comments')
        .send({text: 'blah blah', user_id: TEST_USER._id})
        .expect(HTTP.UNAUTHORIZED)
        .end(done);
    });

    it("doesn't add a comment to the database", function (done) {
        request(app)
        .post('/divesites/' + TEST_DIVESITE._id + '/comments')
        .send({text: 'blah blah', user_id: TEST_USER._id})
        .end(function (err, res) {
          if (err) return done(err);
          Comment.find(function (err, res) {
            if (err) return done(err);
            res.length.should.equal(NUM_COMMENTS);
          });
          done();
        });
    });
  });

  describe("with authorization", function () {

    it("returns HTTP 201 and an object", function (done) {
      request(app)
      .post('/divesites/' + TEST_DIVESITE._id + '/comments')
      .set('force-authenticate', true)
      .set('auth-id', TEST_USER._id)
      .send({text: 'blah blah', user_id: TEST_USER._id})
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.be.an.Object;
        res.body.should.have.properties('_id', 'user', 'created_at', 'updated_at', 'text');
        res.body.user.should.have.properties(['_id', 'displayName', 'picture']);
        done();
      });
    });

    it("adds a comment to the database", function (done) {
      request(app)
      .post('/divesites/' + TEST_DIVESITE._id + '/comments')
      .set('force-authenticate', true)
      .set('auth-id', TEST_USER._id)
      .send({text: 'blah blah', user_id: TEST_USER._id})
      .expect(HTTP.CREATED)
      .end(function (err, res) {
        if (err) return done(err);
        Comment.find(function (err, res) {
          if (err) return done(err);
          res.length.should.equal(NUM_COMMENTS + 1);
        });
        done();
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
