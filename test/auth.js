process.env.NODE_ENV = 'test'; 

var assert = require('assert');
var should = require('should');
var mongoose = require('mongoose');
var express = require('express');

var routes = require('../routes/index');

// Models
var Divesite = require('../models/Divesite');
var User = require('../models/User');

var request = require('supertest');

var app = require('../app');

describe("GET /auth/profile", function () {
  var TEST_USER;
  before(function (done) {
    User.create({displayName: 'TEST_USER'}, function (err, user) {
      TEST_USER = user;
      done();
    });
  });
  after(function (done) {
    User.findOneAndRemove({_id: TEST_USER._id}, done);
  });

  describe("without authorization", function () {
    it('returns HTTP 401', function (done) {
      request(app)
      .get('/auth/profile')
      .expect(401).end(done);
    });
  });

  describe("with authorization", function () {
    it('returns HTTP 200', function (done) {
      request(app).get('/auth/profile')
      .set('force-authenticate', true)
      .set('auth-id', "" + TEST_USER._id)
      .expect(200).end(done);
    });

    it('returns a JSON object', function (done) {
      request(app).get('/auth/profile')
      .set('force-authenticate', true)
      .set('auth-id', "" + TEST_USER._id)
      .end(function (err, res) {
        if (err) { return done(err); }
        should(res.body.displayName).equal('TEST_USER');
        done();
      });
    });
  });

});
