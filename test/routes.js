var assert = require('assert');
var should = require('should');
var mongoose = require('mongoose');
var express = require('express');

var routes = require('../routes/index');

// Models
var Divesite = require('../models/Divesite');
var User = require('../models/User');

var keys = require('../keys');
var request = require('supertest');

var app = express();
app.set('env', 'test');
var divesiteRoutes = require('../routes/divesites');
app.use('/divesites', divesiteRoutes);
var authRoutes = require('../routes/auth');
app.use('/auth', authRoutes);

var dbConnect = function (done) {
  var mongodbConnString = "mongodb://"
  + keys.mongotest.user + ":" + keys.mongotest.password + "@"
  + keys.mongotest.host + ":" + keys.mongotest.port + "/"
  + keys.mongotest.db;
  mongoose.connect(mongodbConnString, function (error) {
    done(error);
  });
};

var dbDisconnect = function () {
  mongoose.disconnect();
}

describe("GET /auth/profile", function () {
  before(dbConnect);
  before(dbDisconnect);
  it('returns HTTP 401 without a valid authorization token', function (done) {
    request(app).get('/auth/profile').expect(401).end(done);
  });
  // TODO: Test the 'happy path'. No authorization tokens are getting stored in the database (yet),
  // so it's non-trivial to do this. What we are *expecting* is a JSON encoding of the User model
  // with a 200 status code.
});


describe("GET /divesites", function () {
  before(dbConnect);
  after(function () {
    mongoose.disconnect();
  });
  beforeEach(function () { });
  afterEach(function () { });

  it("returns HTTP 200", function (done) {
    request(app).get('/divesites').expect(200).end(done);
  });

  it("returns JSON", function (done) {
    request(app).get('/divesites').expect('Content-Type', /json/).end(done);
  });

  it('returns the correct number of divesites', function (done) {
    Divesite.find(function (err, res) {
      // Get the number of dive sites from the database
      var correctLength = res.length;
      request(app).get('/divesites').end(function (err, res) {
        assert.equal(correctLength, res.body.length);
        done();
      });
    });
  });
});


describe("GET /divesites/:id", function () {
  // Some hard-coded values that could potentially change, I guess
  //var validId = "54f5c339d65093780e3a3f2b";
  var invalidId = "44f5c339d65093780e3a3f2b";
  before(dbConnect);
  after(function () { mongoose.disconnect(); });
  it("returns HTTP 200 with a valid ID", function (done) {
    Divesite.find(function (err, res) {
      var validId = res[0]._id;
      request(app).get('/divesites/' + validId).expect(200).end(done);
    });
  });
  it("returns HTTP 404 with an invalid ID of correct length", function (done) {
    // create and delete an object, storing its ID
    Divesite.create({name: "TEST_DIVESITE"}, function (err, res) {
      var id = res._id;
      Divesite.find({'_id': id}).remove(function () {
        // At this point, the ID is no longer valid
        request(app).get('/divesites/' + id).expect(404).end(done);
      });
    });
  });
  it("returns HTTP 404 with an invalid ID of incorrect length", function (done) {
    var shortId = "short";
    request(app).get('/divesites/' + shortId).expect(404).end(done);
  });
});


describe("POST /divesites", function () {
  before(dbConnect);
  after(function () {mongoose.disconnect()});
  afterEach(function (){
    // We have to call exec() at the end of the chain if calling remove()
    // without a callback
    Divesite.find({name: "TEST_DIVESITE"}).remove().exec();
  });

  it("returns HTTP 401 without an authorization token", function (done) {
    request(app).post('/divesites').send({}).expect(401).end(done);
  });

  it("does not add a dive site without authorization", function (done) {
    request(app).post('/divesites').send({name: "TEST_DIVESITE"}).end(function (err, res) {
      // Look for a dive site called "TEST_DIVESITE", which shouldn't exist
      Divesite.findOne({name: "TEST_DIVESITE"}, function (err, result) {
        should(result).be.null; // shouldn't exist, because POST should have failed
        done();
      });
    });
  });

  // TODO: again, we need the happy path.
});

describe("PUT /divesites/:id", function () {
  before(dbConnect);
  after(dbDisconnect);
  //after(function () {mongoose.disconnect()});

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

  it("returns HTTP 401 without an authorization token", function (done) {
    Divesite.findOne({name: "TEST_DIVESITE"}, function (err, res) {
      request(app).put('/divesites/' + res._id).send({}).end(function (err, result) {
        should.equal(result.status, 401);
        done();
      });
    });
  });
});

describe("PATCH /divesites/:id", function () {
  before(dbConnect);
  after(dbDisconnect);

  beforeEach(function (done) {
    // Set up each PATCH test by creating a test divesite
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

  it("returns HTTP 401 without an authorization token", function (done) {
    Divesite.findOne({name: "TEST_DIVESITE"}, function (err, res) {
      if (err) {
        done(err);
      }
      else {
        request(app).patch('/divesites/' + res._id).send({name: 'CHANGED_NAME'}).end(function (err, result) {
          should.equal(result.status, 401);
          done();
        });
      }
    });
  });
});
