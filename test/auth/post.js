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

var utils = require('../utils');

describe ("POST auth/profile", function (done) {
  describe("without authentication", function () {
    it("returns HTTP 401", function (done) {
      request(app)
      .post('/auth/profile')
      .expect(HTTP.UNAUTHORIZED)
      .end(done);
    });
  });

  describe("with authentication", function (done) {
    before(function (done) {
      User.find().remove(function () {
        utils.createUser(done);
      });
    });
    after(function (done) {
      User.find().remove(done);
    });

    it("returns HTTP 405", function (done) {
      User.findOne(function (err, user) {
        if (err) return done(err);
        request(app)
        .post('/auth/profile')
        .set('force-authenticate', true)
        .set('auth-id', user._id)
        .expect(HTTP.METHOD_NOT_ALLOWED)
        .end(done);
      });
    });
  });
});

