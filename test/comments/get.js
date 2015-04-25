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


function createComment (done) {
  Divesite.findOne(function (err, site) {
    //var site = sites[0];
    if (err) return done(err);
    User.findOne(function (err, user) {
      if (err) return done(err);
      //var user = users[0];
      // Add a comment to the database
      var userObj = { _id: user._id, picture: user.picture, displayName: user.displayName };
      var comment = { divesite_id: site._id, user: userObj, text: "blah blah blah" };
      //console.log("trying to create a comment");
      //console.log(comment);
      Comment.create(comment, function (err, comment) {
        if (err) return done(err);
        //console.log("created a comment");
        done();
      });
    });
  });
}


describe("GET /divesites/:id/comments", function () {
  var SITE, USER;


  before(beforeAll);
  after(tearDown);

  describe("with a valid ID", function () {
    describe("with comments", function () {

      before(createComment);
      after(destroyAllComments);

      it("returns HTTP 200 and a list of comments", function (done) {
        Divesite.findOne(function (err, site) {
          if (err) return done(err);
          request(app)
          .get('/divesites/' + site._id + '/comments')
          .expect(HTTP.OK)
          .end(function (err, res) {
            if (err) return done(err);
            res.body.should.be.an.Array;
            res.body.should.have.length(1);
            res.body[0].should.have.properties(['_id', 'divesite_id', 'user', 'text', 'updated_at']);
            res.body[0].user.should.have.properties(['_id', 'displayName', 'picture']);
            done();
          });
        });
      })
    });

    describe("with no comments", function () {
      it("returns HTTP 200 and an empty list", function (done) {
        Divesite.findOne(function (err, site) {
          if (err) return done(err);
          request(app).get('/divesites/' + site._id + '/comments').expect(HTTP.OK).end(function (err, res) {
            if (err) return done(err);
            res.body.should.be.an.Array;
            res.body.should.be.empty;
            done();
          });
        });
      });
    });
  });

  describe("with an invalid ID", function () {
    it("returns HTTP 404", function (done) {
      var badId = "bad_id";
      request(app)
      .get('/divesites/' + badId + '/comments')
      .expect(404)
      .end(done);
    });
  });
});

describe("GET /comments/:id", function () {
  var USER, SITE;

  before(beforeAll);
  after(tearDown);

  describe("with a valid comment ID", function () {

    before(createComment);
    after(destroyAllComments);

    it("returns HTTP 200 and the expected JSON data", function (done) {
      Comment.findOne(function (err, comment) {
        if (err) return done(err);
        request(app).get('/comments/' + comment._id).expect(HTTP.OK).end(function (err, res) {
          if (err) return done(err);
          res.body.should.have.properties(['_id', 'user', 'divesite_id', 'updated_at']);
          res.body._id.should.be.a.String;
          res.body.user.should.be.an.Object;
          res.body.user.should.have.properties(['_id', 'picture', 'displayName']);
          res.body.divesite_id.should.be.a.String;
          done();
        });
      });
    });
  });

  describe("with a valid ID that doesn't match", function () {
    var invalidId;
    before(function (done) {
      Divesite.findOne(function (err, site) {
        if (err) return done(err);
        User.findOne(function (err, user) {
          if (err) return done(err);
          var userObj = { _id: user._id, picture: user.picture, displayName: user.displayName };
          var comment = { divesite_id: site._id, user: userObj, text: "blah blah blah" };
          Comment.create(comment, function (err, comment) {
            if (err) return done(err);
            invalidId = comment._id;
            Comment.findOne({_id: invalidId}).remove(done);
          });
        });
      });
    });

    it("returns HTTP 404", function (done) {
      request(app).get('/comments/' + invalidId).expect(HTTP.NOT_FOUND).end(function (err, res) {
        res.body.should.be.an.Object;
        res.body.should.be.empty;
        done();
      });
    });
  });

  describe("with an invalid ID", function () {
    it("returns HTTP 404", function (done) {
      request(app).get('/comments/bad_id/').expect(HTTP.NOT_FOUND).end(function (err, res) {
        res.body.should.be.an.Object;
        res.body.should.be.empty;
        done();
      });
    });
  });
});

describe("GET /comments/", function () {
  it("returns HTTP 404", function (done) {
    request(app).get('/comments/').expect(HTTP.NOT_FOUND).end(done);
  });
  it("doesn't return anything", function (done) {
    request(app).get('/comments/').end(function (err, res) {
      // console.log(res.body);
      res.body.should.be.empty;
      done();
    });
  });
});
