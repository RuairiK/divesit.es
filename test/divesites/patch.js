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

describe("PATCH /divesites/:id", function () {
  var USER, DIVESITE;
  before(function (done) {
    User.create({displayName: 'TEST_USER'}, function (err, user) {
      USER = user;
      done();
    });
  });
  after(function (done) {
    User.findOneAndRemove({_id: USER._id}, done);
  });

  beforeEach(function (done) {
    var site = {
      name: "TEST_DIVESITE",
      category: "wreck",
      loc: [0.0, 0.0],
      chart_depth: 100,
      description: "desc"
    };
    Divesite.create(site, function (err, res) {
      DIVESITE = res;
      done();
    });
  });

  afterEach(function (done) {
    Divesite.find({name: "TEST_DIVESITE"}).remove().exec();
    Divesite.find({name: "CHANGED_NAME"}).remove().exec();
    done();
  });

  describe("without authorization", function () {
    it("returns HTTP 401", function (done) {
      request(app)
      .patch('/divesites/' + DIVESITE._id)
      .send({name: 'CHANGED_NAME'})
      .expect(HTTP.UNAUTHORIZED)
      .end(function (err, result) {
        if (err) return done(err);
        done();
      });
    });
    it("doesn't change the site in the database", function (done) {
      request(app)
      .patch('/divesites' + DIVESITE._id)
      .send({name: 'CHANGED_NAME'})
      .end(function (err, res) {
        if (err) return done(err);
        Divesite.findOne({_id: DIVESITE._id}, function (err, site) {
          if (err) return done(err);
          site.name.should.be.equal(DIVESITE.name);
          done();
        });
      });
    });
  });

  describe("with authorization", function () {
    it("returns HTTP 200", function (done) {
      request(app)
      .patch('/divesites/' + DIVESITE._id)
      .set('force-authenticate', true)
      .set('auth-id', USER._id)
      .send({name: 'CHANGED_NAME'})
      .expect(200)
      .end(done);
    });
    it("updates the site in the database", function (done) {
      var newName = 'CHANGED_NAME';
      request(app)
      .patch('/divesites/' + DIVESITE._id)
      .set('force-authenticate', true)
      .set('auth-id', USER._id)
      .send({name: newName})
      .end(function (err, res) {
        if (err) return done(err);
        Divesite.findOne({_id: DIVESITE._id}, function (err, site) {
          if (err) return done(err);
          site.name.should.equal(newName);
          done();
        });
      });
    });

  });
});
