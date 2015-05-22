process.env.NODE_ENV = 'test'

async = require 'async'
assert = require('assert')
should = require('should')
mongoose = require('mongoose')
express = require('express')
HTTP = require('http-status-codes')
request = require('supertest')
moment = require 'moment'

routes = require('../../../routes/index')
Divesite = require('../../../models/Divesite')
User = require('../../../models/User')
app = require('../../../app')
utils = require('../utils')

describe "DELETE /divesites/:id", () ->

  beforeEach utils.createSiteAndUser
  afterEach utils.tearDown

  describe "without authorization", () ->
    it "returns HTTP 401 and doesn't delete", (done) ->
      async.waterfall [
        (cb) -> Divesite.findOne cb
        (site, cb) ->
          request app
            .delete "/divesites/#{site._id}"
            .expect HTTP.UNAUTHORIZED
            .end (e, res) ->
              Divesite.findById {_id: site._id}, (e, s) -> cb(e, site, s)
        (original, updated, cb) ->
          should(updated).not.be.null
          cb()
      ], done

  describe "with authorization", () ->
    describe "with a valid site ID", () ->
      describe "as the site's creator", () ->
        it "deletes the site and returns HTTP 204", (done) ->
          async.waterfall [
            (cb) -> Divesite.findOne cb
            (site, cb) -> User.findOne (e, user) -> cb(e, site, user, cb)
            (site, user, cb) ->
              # Make this user the creator
              site.creator_id = user._id
              site.save (e, s) -> cb(e, s, user)
            (site, user, cb) -> 
              request app
                .delete "/divesites/#{site._id}"
                .set "force-authenticate", true
                .set 'auth-id', user._id
                .expect HTTP.NO_CONTENT
                .end (e, res) -> cb(e, site)
            (site, cb) -> Divesite.findById {_id: site._id}, (e, s) -> cb(e, site, s)
            (original, deleted, cb) ->
              should(deleted).be.null
              cb()
          ], done
      describe "as another user", () ->
        it "returns HTTP 403 and doesn't delete the site", (done) ->
          async.waterfall [
            (cb) -> User.create {displayName: 'OTHER_USER'}, cb
            (user, cb) -> Divesite.findOne (e, site) -> cb(e, site, user)
            (site, user, cb) -> 
              request app
                .delete "/divesites/#{site._id}"
                .set "force-authenticate", true
                .set 'auth-id', "" + user._id
                .expect HTTP.FORBIDDEN
                .end (e, res) -> cb(e, site)
            (site, cb) -> Divesite.findById {_id: site._id}, (e, s) -> cb(e, site, s)
            (original, deleted, cb) ->
              should(deleted).not.be.null
              cb()
          ], done

    it "returns HTTP 404 if given an invalid ID", (done) ->
      async.waterfall [
        (cb) -> User.findOne cb
        (user, cb) -> 
          request app
            .delete "/divesites/invalid"
            .set "force-authenticate", true
            .set 'auth-id', "" + user._id
            .expect HTTP.NOT_FOUND
            .end cb
      ], done
    it "returns HTTP 404 if given a valid ID with no match", (done) ->
      async.waterfall [
        (cb) -> User.findOne cb
        (user, cb) -> 
          site = new Divesite
          request app
            .delete "/divesites/#{site._id}"
            .set "force-authenticate", true
            .set 'auth-id', "" + user._id
            .expect HTTP.NOT_FOUND
            .end cb
      ], done
