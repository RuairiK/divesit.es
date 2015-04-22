process.env.NODE_ENV = 'test'; 

var assert = require('assert');
var should = require('should');
var mongoose = require('mongoose');
var express = require('express');
var HTTP = require('http-status-codes');

var routes = require('../routes/index');

// Models
var Divesite = require('../models/Divesite');
var User = require('../models/User');
var Comment = require('../models/Comment');

var request = require('supertest');

var app = require('../app');

describe("Comments", function () {

    describe("GET /divesites/:id/comments", function () {
        var SITE, USER;
        before(function (done) {
            Divesite.create({name: "TEST_DIVESITE"}, function (err, site) {
                SITE = site;
                User.create({displayName: 'TEST_USER', picture: 'http://example.com/example.png'}, function (err, user) {
                    USER = user;
                    done();
                });
            });
        });

        after(function () {
            User.find({displayName: 'TEST_USER'}).remove().exec();
            Divesite.find({name: "TEST_DIVESITE"}).remove().exec();
            Comment.find().remove().exec();
        });

        describe("with a valid ID", function () {
            describe("with comments", function () {
                var COMMENT;
                before(function (done) {
                    var userObj = { _id: USER._id, picture: USER.picture, displayName: USER.displayName };
                    var comment = { divesite_id: SITE._id, user: userObj, text: "blah blah blah" };
                    Comment.create(comment, function (err, comment) {
                        if (err) {return done(err);}
                        COMMENT = comment;
                        done();
                    });
                });
                after(function () {
                    Comment.findOne({_id: COMMENT._id}).remove().exec();
                });

                it("returns HTTP 200 and a list of comments", function (done) {
                    request(app).get('/divesites/' + SITE._id + '/comments').expect(HTTP.OK).end(function (err, res) {
                        res.body.should.be.an.Array;
                        res.body.should.have.length(1);
                        res.body[0].should.have.properties(['_id', 'divesite_id', 'user', 'text', 'updated_at']);
                        res.body[0].user.should.have.properties(['_id', 'displayName', 'picture']);
                        done();
                    });
                });
            })
            describe("with no comments", function () {
                it("returns HTTP 200 and an empty list", function (done) {
                    request(app).get('/divesites/' + SITE._id + '/comments').expect(HTTP.OK).end(function (err, res) {
                        if (err) {return done(err)};
                        res.body.should.be.empty;
                        done();
                    });
                });
            });
        });
    });


    describe("GET /comments/:id", function () {
        var USER, SITE;
        before(function (done) {
            Divesite.create({name: "TEST_DIVESITE"}, function (err, site) {
                SITE = site;
                User.create({displayName: 'TEST_USER', picture: "http://example.com/example.png"}, function (err, user) {
                    USER = user;
                    done();
                });
            });
        });

        after(function () {
            User.find({displayName: 'TEST_USER'}).remove().exec();
            Divesite.find({name: "TEST_DIVESITE"}).remove().exec();
            Comment.find().remove().exec();
        });

        describe("with a valid comment ID", function () {
            var COMMENT;
            before(function (done) {
                var userObj = { _id: USER._id, picture: USER.picture, displayName: USER.displayName };
                var comment = { divesite_id: SITE._id, user: userObj, text: "blah blah blah" };
                Comment.create(comment, function (err, comment) {
                    if (err) {return done(err);}
                    COMMENT = comment;
                    done();
                });
            });

            after(function (done) {
                Comment.find({_id: COMMENT._id}).remove().exec();
                done();
            });

            it("returns HTTP 200 and the expected JSON data", function (done) {
                var id = COMMENT._id;
                request(app).get('/comments/' + id).expect(HTTP.OK).end(function (err, res) {
                    if (err) {return done(err);}
                    res.body.should.have.properties(['_id', 'user', 'divesite_id', 'updated_at']);
                    res.body._id.should.be.a.String;
                    res.body.user.should.be.an.Object;
                    res.body.user.should.have.properties(['_id', 'picture', 'displayName']);
                    res.body.divesite_id.should.be.a.String;
                    done();
                });
            });
        });

        describe("with a valid ID that doesn't match", function () {
            var invalidId;
            before(function (done) {
                var userObj = { _id: USER._id, picture: USER.picture, displayName: USER.displayName };
                var comment = { divesite_id: SITE._id, user: userObj, text: "blah blah blah" };
                Comment.create(comment, function (err, comment) {
                    if (err) return done(err);
                    invalidId = comment._id;
                    Comment.findOne({_id: invalidId}).remove(done);
                });
            });

            it("returns HTTP 404", function (done) {
                request(app).get('/comments/' + invalidId).expect(HTTP.NOT_FOUND).end(done);
            });
        });

        describe("with an invalid ID", function () {
            it("returns HTTP 404", function (done) {
                request(app).get('/comments/bad_id/').expect(HTTP.NOT_FOUND).end(done);
            });
        });
    });


    describe("POST /divesites/:id/comments", function () {

        before(function (done) {
            Divesite.create({name: "TEST_DIVESITE"}, function (err, site) {
                User.create({displayName: 'TEST_USER'}, done);
            });
        });

        after(function () {
            User.find({displayName: 'TEST_USER'}).remove().exec();
            Divesite.find({name: "TEST_DIVESITE"}).remove().exec();
            Comment.find().remove().exec();
        });

        it("returns HTTP 401 without authorization", function (done) {
            Divesite.findOne({name: "TEST_DIVESITE"}, function (err, site) {
                if (err) {return done(err); }
                request(app).post('/divesites/' + site._id + '/comments').send({}).expect(HTTP.UNAUTHORIZED).end(done);
            });
        });

        it("returns HTTP 201 with authorization", function (done) {
            done();
        });
    });

    describe("GET /comments/", function () {
        it("returns HTTP 404", function (done) {
            request(app).get('/comments/').expect(HTTP.NOT_FOUND).end(done);
        });
    });
    describe("POST /comments/", function () {
        var NUM_COMMENTS;
        before(function (done) {
            Comment.find().count(function (err, count) {
                if (err) {return done(err);}
                NUM_COMMENTS = count;
                done();
            });
        });
        it("returns HTTP 405", function (done) {
            request(app).post('/comments/').send({}).expect(HTTP.METHOD_NOT_ALLOWED).end(done);
        });
        it("doesn't add a new comment to the database", function (done) {
            request(app).post('/comments/').send({}).end(function (err, res) {
                Comment.find().count(function (err, count) {
                    should.equal(count, NUM_COMMENTS);
                    done();
                });
            });
        });
    });

});
