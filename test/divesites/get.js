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


describe("GET /divesites", function () {
  it("returns HTTP 200 and a list of objects", function (done) {
    request(app)
    .get('/divesites')
    .expect(HTTP.OK)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      res.body.should.be.an.Array;
      res.body.forEach(function (o) {
        o.should.be.an.Object;
      });
      done();
    });
  });

  it('retrieves the correct number of sites from the database', function (done) {
    Divesite.find(function (err, res) {
      // Get the number of dive sites from the database
      var correctLength = res.length;
      request(app)
      .get('/divesites')
      .end(function (err, res) {
        should.equal(res.body.length, correctLength);
        done();
      });
    });
  });
});

describe("GET /divesites/:id", function () {

  describe("with a valid ID", function () {
    it("returns HTTP 200 and an object with the expected properties", function (done) {
      Divesite.find(function (err, res) {
        var validId = res[0]._id;
        request(app)
        .get('/divesites/' + validId)
        .expect(HTTP.OK)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          res.body.should.be.an.Object;
          res.body.should.have.properties(['_id', 'loc', 'name', 'category', 'updated_at']);
          res.body.loc.should.be.an.Array;
          res.body.loc[0].should.be.a.Number;
          res.body.loc[1].should.be.a.Number;
          done();
        });
      });
    });
  });

  describe("with a valid ID with no match", function () {
    it("returns HTTP 404 and an empty object", function (done) {
      // create and delete an object, storing its ID
      Divesite.create({name: "TEST_DIVESITE"}, function (err, res) {
        var id = res._id;
        Divesite.find({'_id': id}).remove(function () {
          // At this point, the ID is no longer valid
          request(app)
          .get('/divesites/' + id)
          .expect(HTTP.NOT_FOUND)
          .expect('Content-Type', /json/)
          .end(function (err, res) {
            if(err) return done(err);
            res.body.should.be.an.Object;
            res.body.should.be.empty;
            done();
          });
        });
      });
    });
  });

  describe("with an invalid ID", function () {
    it("returns HTTP 404 and an empty object", function (done) {
      var shortId = "short";
      request(app)
      .get('/divesites/' + shortId)
      .expect(HTTP.NOT_FOUND)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if(err) return done(err);
        res.body.should.be.an.Object;
        res.body.should.be.empty;
        done();
      });
    });
  });
});
