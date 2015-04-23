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
var app = require.main.require('app');

describe("PUT /divesites/:id", function () {
  beforeEach(function (done) {
    // Set up each PUT test by creating a test divesite
    var site = {
      name: "TEST_DIVESITE",
      category: "wreck",
      loc: [0.0, 0.0],
      chart_depth: 100,
      description: "desc"
    };
    Divesite.create(site, function (err, res) {
      done();
    });
  });

  afterEach(function (done) {
    // Tear down
    Divesite.find({name: "TEST_DIVESITE"}).remove(function () {
      done();
    });
  });

  it("returns HTTP 401 without authorization", function (done) {
    Divesite.findOne({name: "TEST_DIVESITE"}, function (err, res) {
      request(app).put('/divesites/' + res._id).send({}).expect(HTTP.UNAUTHORIZED).end(done);
    });
  });
});

