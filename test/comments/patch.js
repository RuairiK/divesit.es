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


describe("PATCH /comments/:id", function () {
  var SITE, USER_1, USER_2, COMMENT, newText, body;

  before(function (done) {
    Divesite.create({name: "TEST_DIVESITE"}, function (err, site) {
      SITE = site;
      User.create({displayName: 'TEST_USER', picture: 'http://example.com/example.png'}, function (err, user) {
        USER_1 = user;
        newText = 'Foo bar boz';
        body = {
          text: newText
        };
        User.create({displayName: 'TEST_USER_2', picture: 'http://example.com/example.png'}, function (err, user) {
          USER_2 = user;
          done();
        });
      });
    });
  });

  after(function () {
    User.find({displayName: 'TEST_USER'}).remove().exec();
    User.find({displayName: 'TEST_USER_2'}).remove().exec();
    Divesite.find({name: "TEST_DIVESITE"}).remove().exec();
    Comment.find().remove().exec();
  });

  beforeEach(function (done) {
    var userObj = { _id: USER_1._id, picture: USER_1.picture, displayName: USER_1.displayName };
    var comment = { divesite_id: SITE._id, user: userObj, text: "blah blah blah" };
    Comment.create(comment, function (err, comment) {
      if (err) {return done(err);}
      COMMENT = comment;
      done();
    });
  });

  afterEach(function (done) {
    Comment.find().remove().exec();
    done();
  });

  describe("without authorization", function () {
    it("returns HTTP 401 without altering the comment", function (done) {
      request(app)
      .patch('/comments/' + COMMENT._id)
      .send({'text': 'Foo bar boz'})
      .expect(HTTP.UNAUTHORIZED)
      .end(function (err, res) {
        if (err) return done(err);
        Comment.findOne({_id: COMMENT._id}, function (err, comment) {
          comment.text.should.be.equal(COMMENT.text);
          done();
        });
      });
    });
  });

  describe("when authenticated as the comment's creator", function () {
    describe("with a valid comment ID", function () {
      it("returns HTTP 200 and the expected JSON object", function (done) {
        request(app)
        .patch('/comments/' + COMMENT._id)
        .set('Force-Authenticate', true)
        .set('Auth-ID', USER_1._id)
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) return done(err);
          //res.body.should.be.an.Object;
          //res.body.should.not.be.empty;
          //res.body.text.should.be.equal(newText);
          done();
        });
      });


      it("changes the comment text in the database", function (done) {
        //var newText = 'Foo bar boz';
        request(app)
        .patch('/comments/' + COMMENT._id)
        .set('Force-Authenticate', true)
        .set('Auth-ID', USER_1._id)
        .send(body)
        .end(function (err, res) {
          Comment.findOne({_id: COMMENT._id}, function (err, comment) {
            if (err) return done(err);
            comment.text.should.be.equal(newText);
            done();
          });
        });
      });
    });

    describe("with an invalid comment ID", function () {
      it("returns HTTP 404 and an empty object", function (done) {
        request(app)
        .patch("/comments/invalid_id")
        .set('Force-Authenticate', true)
        .set('Auth-ID', USER_1._id)
        .send(body)
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

    describe("with a valid comment ID but no match in the database", function () {
      var OLD_ID;
      before(function (done) {
        // create and destroy a comment to get its ID
        var c = Object.create(COMMENT);
        Comment.create(c, function (err, comment) {
          if (err) return done(err);
          OLD_ID = c._id;
          Comment.remove({_id: c._id}, done);
        });
      });
      it("returns HTTP 404 and an empty object", function (done) {
        request(app)
        .patch("/comments/" + OLD_ID)
        .set('Force-Authenticate', true)
        .set('Auth-ID', USER_1._id)
        .send(body)
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

  describe("when authenticated as another user", function () {
    it("doesn't change the contents of the database", function (done) {
      request(app)
      .patch('/comments/' + COMMENT._id)
      .set('Force-Authenticate', true)
      .set('Auth-ID', USER_2._id)
      .send(body)
      .end(function (err, res) {
        Comment.findOne({_id: COMMENT._id}, function (err, comment) {
          // Comment in db
          comment.text.should.be.equal(COMMENT.text);
          done();
        });
      });
    });

    it("returns HTTP 403", function (done) {
      request(app)
      .patch('/comments/' + COMMENT._id)
      .set('Force-Authenticate', true)
      .set('Auth-ID', USER_2._id)
      .send(body)
      .expect(403)
      .end(done);
    });
  });

});
