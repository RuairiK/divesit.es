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
var utils = require.main.require('test/utils');

describe("DELETE /divesites/:id", function () {

  beforeEach(utils.createSiteAndUser);
  afterEach(utils.tearDown);

  describe("without authorization", function () {
    it("returns HTTP 401", function (done) {
      Divesite.findOne(function (err, site) {
        if (err) return done(err);
        request(app)
        .delete('/divesites/' + site._id)
        .expect(HTTP.UNAUTHORIZED)
        .end(function (err, res) {
          Divesite.findById({_id: site._id}, function (err, site) {
            should(site).not.be.null;
            done();
          });
        });
      });
    });
  });

  describe ("with authorization", function () {
    describe("with a valid site ID", function () {
      describe("as the site's creator", function () {
        it("deletes the site and returns HTTP 204", function (done) {
          Divesite.findOne(function (err, site) {
            if (err) return done(err);
            User.findOne(function (err, user) {
              if (err) return done(err);
              // Assign this user as the site's creator
              site.creator_id = user._id;
              site.save(function (err, site) {
                if (err) return done(err);
                request(app)
                .delete('/divesites/' + site._id)
                .set('force-authenticate', true)
                .set('auth-id', user._id)
                .expect(HTTP.NO_CONTENT)
                .end(function (err, res) {
                  if (err) return done(err);
                  // Check that the site is no longer in the database
                  Divesite.findById({_id: site._id}, function (err, site) {
                    if (err) return done(err);
                    should(site).be.null;
                    done();
                  });
                });
              });
            });
          });
        });
      });
      describe("as another user", function () {
        it("returns HTTP 403 and doesn't delete the divesite", function (done) {
          User.findOne(function (err, user) {
            if (err) return done(err);
            Divesite.findOne(function (err, site) {
              if (err) return done(err);
              site.creator_id = user._id;
              site.save(function (err) {
                if (err) return done(err);
                User.create({ displayName: 'OTHER_USER', picture: 'http://example.com/png' }, function (err, otherUser) {
                  if (err) return done(err);
                  request(app)
                  .delete('/divesites/' + site._id)
                  .set('force-authenticate', true)
                  .set('auth-id', otherUser._id)
                  .expect(HTTP.FORBIDDEN)
                  .end(function (err, res) {
                    if (err) return done(err);
                    Divesite.findById(site._id, function (err, res) {
                      if (err) return done(err);
                      should(res).not.be.null;
                      res.be.an.Object;
                      res.should.not.be.empty;
                      res._id.should.equal(site._id);
                      res.name.should.equal(site.name);
                    });
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });

    describe("with a site ID with no match", function () {
      it("returns HTTP 404", function (done) {
        Divesite.findOne(function (err, site) {
          var id = site._id;
          User.findOne(function (err, user) {
            if (err) return done(err);
            Divesite.findByIdAndRemove(id, function (err) {
              if (err) return done(err);
              request(app)
              .delete('/divesites/' + id)
              .set('force-authenticate', true)
              .set('auth-id', user._id)
              .expect(HTTP.NOT_FOUND)
              .end(done);
            });
          });
        });
      });
    });
    
    describe("with an invalid site ID", function () {
      it("returns HTTP 404", function (done) {
        User.findOne(function (err, user) {
          if (err) return done(err);
          request(app)
          .delete('/divesites/invalid_id')
          .set('force-authenticate', true)
          .set('auth-id', user._id)
          .expect(HTTP.NOT_FOUND)
          .end(done);
        });
      });
    });
  });
});
