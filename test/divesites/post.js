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


describe("POST /divesites", function () {
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

  afterEach(function () {
    // We have to call exec() at the end of the chain if calling remove()
    // without a callback
    Divesite.find({name: "TEST_DIVESITE"}).remove().exec();
  });

  describe("without authorization", function () {
    it("returns HTTP 401", function (done) {
      request(app)
      .post('/divesites')
      .send({})
      .expect(HTTP.UNAUTHORIZED)
      .end(done);
    });

    it("does not add a dive site to the database", function (done) {
      request(app)
      .post('/divesites')
      .send({name: "TEST_DIVESITE", })
      .end(function (err, res) {
        if(err) return done(err);
        // Look for a dive site called "TEST_DIVESITE", which shouldn't exist
        Divesite.findOne({name: "TEST_DIVESITE"}, function (err, result) {
          should(result).be.null;
          done();
        });
      });
    });
  });

  describe("with authentication", function () {
    var newSite, body;
    before(function () {
      newSite = {
        name: "TEST_DIVESITE",
        category: "wreck",
        coords: {
          longitude: 0,
          latitude: 0
        },
        chart_depth: 100
      };
      body = newSite;
    });

    it("returns HTTP 201 and the new site data", function (done) {
      request(app).post('/divesites')
      .set('force-authenticate', true)
      .set('auth-id', TEST_USER._id)
      .send(body)
      .expect(HTTP.CREATED)
      .end(done);
    });

    it("adds a new dive site", function (done) {
      request(app).post('/divesites')
      .set('force-authenticate', true)
      .set('auth-id', TEST_USER._id)
      .send(body)
      .expect(HTTP.CREATED)
      .end(function (err, res) {
        if (err) { return done(err); }
        Divesite.findOne({name: 'TEST_DIVESITE'}, function (err, newSite) {
          if (err) { return done(err); }
          // Check properties of returned data
          (newSite).should.not.be.null;
          newSite.should.be.an.Object;
          newSite.should.not.be.empty;
          newSite.should.have.properties(['_id', 'name', 'category', 'loc', 'updated_at']);
          newSite.loc.should.be.an.Array;
          newSite.loc.should.have.length(2);
          newSite.loc[0].should.be.a.Number;
          newSite.loc[1].should.be.a.Number;
          done();
        });
      });
    });
  });
});
