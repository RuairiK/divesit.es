process.env.NODE_ENV = 'test'; 

var assert = require('assert');
var should = require('should');
var mongoose = require('mongoose');
var express = require('express');
var request = require('supertest');
var HTTP = require('http-status-codes');

var routes = require.main.require('routes/index');
var Divesite = require.main.require('models/Divesite');
var User = require.main.require('models/User');
var app = require.main.require('app');

describe("GET /auth/profile", function () {

  before(function (done) {
    User.find().remove(function () {
      User.create({displayName: 'TEST_USER'}, function (err, user) {
        done();
      });
    });
  });

  after(function (done) {
    User.find().remove(done);
  });

  describe("without authorization", function () {
    it('returns HTTP 401', function (done) {
      request(app)
      .get('/auth/profile')
      .expect(HTTP.UNAUTHORIZED).end(done);
    });
  });

  describe("with authorization", function () {
    User.findOne(function (err, user) {
      if (err) return done(err);
      it('returns HTTP 200', function (done) {
        request(app).get('/auth/profile')
        .set('force-authenticate', true)
        .set('auth-id', "" + user._id)
        .expect(HTTP.OK).end(done);
      });
    });

    it('returns a JSON object', function (done) {
      User.findOne(function (err, user) {
        if (err) return done(err);
        request(app).get('/auth/profile')
        .set('force-authenticate', true)
        .set('auth-id', "" + user._id)
        .end(function (err, res) {
          if (err) { return done(err); }
          should(res.body.displayName).equal('TEST_USER');
          done();
        });
      });
    });
  });

});
