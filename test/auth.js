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
    before(function (done) {
        User.create({displayName: 'TEST_USER'}, done);
    });
    after(function (done) {
        User.findOneAndRemove({displayName: 'TEST_USER'}, done);
    });

    it('returns HTTP 401 without a valid authorization token', function (done) {
        request(app).get('/auth/profile').expect(401).end(done);
    });

    it('returns HTTP 200 when authentication is OK', function (done) {
        request(app).get('/auth/profile').send({forceAuthenticate: true, displayName: 'TEST_USER'}).expect(200).end(done);
    });

    it('returns a JSON object when authentication is OK', function (done) {
        request(app).get('/auth/profile').send({'forceAuthenticate': true, displayName: 'TEST_USER'}).end(function (err, res) {
            if (err) { return done(err); }
            should(res.body.displayName).equal('TEST_USER');
            done();
        });
    });
});
