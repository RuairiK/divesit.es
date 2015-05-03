process.env.NODE_ENV = 'test'

async = require 'async'
assert = require('assert')
should = require('should')
mongoose = require('mongoose')
express = require('express')
HTTP = require('http-status-codes')
request = require('supertest')
moment = require 'moment'

routes = require.main.require('routes/index')
Divesite = require.main.require('models/Divesite')
User = require.main.require('models/User')
app = require.main.require('app')
utils = require('../utils')

describe "PATCH /divesites/:id", () ->
  before utils.createSiteAndUser
  after utils.tearDown

  beforeEach utils.createComment
  afterEach utils.destroyAllComments

  describe "without authorization", () ->
    it "returns HTTP 401 and doesn't perform the update", (done) ->
      async.waterfall [
        (cb) -> Divesite.findOne cb
        (site, cb) ->
          request app
            .patch "/divesites/#{site._id}/"
            .send {name: 'CHANGED_NAME'}
            .expect HTTP.UNAUTHORIZED
            .end (err, res) -> cb(err, site)
        (site, cb) -> Divesite.findOne {_id: site._id}, (e, updated) -> cb(e, site, updated)
        (original, updated, cb) ->
          updated.name.should.equal original.name
          cb()
      ], done
  describe "with authorization", () ->
    describe "with a valid site ID", () ->
      describe "as the site's creator", () ->
        it "handles invalid data gracefully", (done) ->
          async.waterfall [
            (cb) -> Divesite.findOne cb
            (site, cb) -> User.findOne (e, user) -> cb(e, site, user)
            (site, user, cb) ->
              # Expect HTTP 400
              request app
                .patch "/divesites/#{site._id}"
                .set 'force-authenticate', true
                .set 'auth-id', user._id
                .send {
                  coords: {longitude: 'five', latitude: 'banana'}
                  depth: "real deep"
                  category: "Some totally bogus category that will never be implemented"
                }
                .expect HTTP.BAD_REQUEST
                .end (e, res) -> cb(e, site, res)
            (site, res, cb) -> 
              # Expect errors in response
              res.body.should.be.an.Object
              res.body.should.have.properties ['errors']
              res.body.errors.should.have.properties ['loc', 'chart_depth', 'category']
              Divesite.findOne {_id: site._id}, (e, updated) -> cb(e, site, updated)
            (original, updated, cb) ->
              updated.loc.should.be.an.Array
              updated.chart_depth.should.equal original.chart_depth
              updated.category.should.equal original.category
              cb()
          ], done
        it "updates only allowed fields", (done) ->
          async.waterfall [
            (cb) -> Divesite.findOne cb
            (site, cb) -> User.findOne (e, user) -> cb(e, site, user)
            (site, user, cb) ->
              u = new User # create a dummy user
              request app
                .patch "/divesites/#{site._id}"
                .set 'force-authenticate', true
                .set 'auth-id', user._id
                .send {
                  name: "CHANGED_NAME"
                  created_at: moment().subtract(10, 'days').toDate()
                  updated_at: moment().subtract(10, 'days').toDate()
                  creator_id: u._id
                }
                .expect HTTP.OK
                .end (e, res) -> cb(e, site, user)
            (site, user, cb) ->
              Divesite.findOne {_id: site.id}, (e, updated) -> cb(e, site, updated, user)
            (original, updated, user, cb) ->
              # Check fields
              updated.name.should.equal "CHANGED_NAME"
              moment(updated.created_at).should.be.above(moment(original.created_at) - 1000)
              moment(updated.updated_at).should.be.below(moment(original.updated_at) + 1000)
              should.equal updated.creator_id, original.creator_id
              cb()
          ], done

    describe "with an invalid site ID", () ->
      it "returns HTTP 404", (done) ->
        async.waterfall [
          (cb) -> User.findOne cb
          (user, cb) -> 
            request app
              .patch "/divesites/invalid_id"
              .set 'force-authenticate', true
              .set 'auth-id', user._id
              .send {name: "CHANGED_NAME"}
              .expect HTTP.NOT_FOUND
              .end cb
        ], done
    describe "with a valid ID but no match", () ->
      it "returns HTTP 404", (done) ->
        async.waterfall [
          (cb) -> User.findOne cb
          (user, cb) -> 
            s = new Divesite
            request app
              .patch "/divesites/#{s._id}"
              .set 'force-authenticate', true
              .set 'auth-id', user._id
              .send {name: "CHANGED_NAME"}
              .expect HTTP.NOT_FOUND
              .end cb
        ], done
