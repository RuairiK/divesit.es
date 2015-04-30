process.env.NODE_ENV = 'test'; 

var assert = require('assert');
var should = require('should');
var mongoose = require('mongoose');
var express = require('express');
var HTTP = require('http-status-codes');
var request = require('supertest');
var moment = require('moment');

var routes = require.main.require('routes/index');
var Divesite = require.main.require('models/Divesite');
var User = require.main.require('models/User');
var Comment = require.main.require('models/Comment');
var app = require.main.require('app');
var utils = require.main.require('test/utils');

//function afterAll () {
  //Divesite.find().remove().exec();
  //User.find().remove().exec();
  //Comment.find().remove().exec();
//}
var afterAll = utils.tearDown;

describe("PATCH /divesites/:id", function () {


  before(utils.createSiteAndUser);
  after(afterAll);

  beforeEach(function (done) {
    User.findOne(function (err, user) {
      var site = {
        name: "TEST_DIVESITE",
        category: "wreck",
        loc: [0, 0],
        chart_depth: 100,
        description: "desc",
        creator_id: user._id
      };
      Divesite.create(site, function (err, res) {
        //DIVESITE = res;
        done(err);
        //});
      });
    });
  });


  afterEach(function (done) {
    // After each test, remove all divesites
    Divesite.find().remove(done);
  });

  describe("without authorization", function () {
    Divesite.findOne(function (err, site) {
      it("returns HTTP 401", function (done) {
        request(app)
        .patch('/divesites/' + site._id)
        .send({name: 'CHANGED_NAME'})
        .expect(HTTP.UNAUTHORIZED)
        .end(done);
      });
    });

    it("doesn't change the site in the database", function (done) {
      Divesite.findOne(function (err, site) {
        request(app)
        .patch('/divesites' + site._id)
        .send({name: 'CHANGED_NAME', depth: 100})
        .end(function (err, res) {
          if (err) return done(err);
          Divesite.findOne(function (err, newSite) {
            if (err) return done(err);
            site.name.should.be.equal(newSite.name);
            site.chart_depth.should.be.equal(newSite.chart_depth);
            done();
          });
        });
      });
    });
  });

  describe("with authorization", function () {

    describe("with a valid site ID", function () {

      describe("as the site's creator", function () {

        it("handles invalid data gracefully", function (done) {
          Divesite.findOne(function (err, site) {
            User.findOne(function (err, user) {
              request(app)
              .patch('/divesites/' + site._id)
              .set('force-authenticate', true)
              .set('auth-id', user._id)
              .send({
                coords: {longitude: 'five', latitude: 'banana'},
                depth: "real deep",
                category: 'Some totally bogus category that will never be implemented!'
              })
              .expect(HTTP.BAD_REQUEST)
              .end(function (err, res) {
                if (err) return done(err);
                res.body.should.be.an.Object;
                res.body.should.have.properties(['errors']);
                res.body.errors.should.be.an.Object;
                res.body.errors.should.have.properties(['loc', 'chart_depth', 'category']);
                // Check that things haven't changed in the db
                Divesite.findOne({_id: site._id}, function (err, newSite) {
                  //should.equal(site.loc, newSite.loc); // throws a *weird* error
                  newSite.loc.should.be.an.Array;
                  newSite.chart_depth.should.be.equal(site.chart_depth);
                  newSite.category.should.be.equal(site.category);
                });
                done();
              });
            });
          });
        });

        it("updates allowed fields in the database", function (done) {
          Divesite.findOne(function (err, site) {
            User.findOne(function (err, USER) {
              var newName = 'CHANGED_NAME';
              var dummyUser = new User(); // non-existent user
              request(app)
              .patch('/divesites/' + site._id)
              .set('force-authenticate', true)
              .set('auth-id', USER._id)
              .expect(HTTP.OK)
              .send({
                name: newName,
                created_at: moment().subtract(10, 'days').toDate(), // try to change creation date
                updated_at: moment().add(10, 'days').toDate(), // try to change update date
                creator_id: dummyUser._id // try to change owner
              })
              .end(function (err, res) {
                if (err) return done(err);
                Divesite.findOne({_id: site._id}, function (err, newSite) {
                  if (err) return done(err);
                  newSite.name.should.equal(newName); // name updated
                  // Times can be a bit fuzzy, so we're allowing a delta in our comparison
                  moment(newSite.created_at).should.be.above(moment(site.updated_at) - 10000);
                  moment(newSite.updated_at).should.be.below(moment(site.updated_at) + 10000);
                  // Coerce IDs to strings because otherwise should.js attempts a deep equal
                  // AFAIK, Mongoose ids will always be strings, but...
                  should.equal("" + newSite.creator_id, "" + site.creator_id); // creator unchanged
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
});
