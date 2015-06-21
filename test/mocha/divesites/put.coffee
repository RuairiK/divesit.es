async = require 'async'
expect = require('chai').expect
HTTP = require('http-status-codes')
request = require('supertest')

utils = require '../utils'
app = require('../../../server/server')
Divesite = app.models.Divesite
User = app.models.User

describe "PUT /divesites/:id", ->

  beforeEach (done) -> async.parallel [
    (cb) -> utils.createUser cb
    (cb) -> utils.createSites cb
  ], done
  afterEach (done) -> utils.tearDown done

  describe "without authentication", ->
    site = {}
    beforeEach (done) ->
      Divesite.findOne (err, res) ->
        site = res
        done err
    it "returns HTTP 401", (done) ->
      request app
        .put "/api/divesites/#{site.id}"
        .send {name: "NEW_NAME"}
        .expect HTTP.UNAUTHORIZED
        .end done
    it "doesn't patch an existing divesite", (done) ->
      request app
        .put "/api/divesites/#{site.id}"
        .send {name: "NEW_NAME"}
        .end (err, res) ->
          Divesite.find {where: {name: "NEW_NAME"}}, (err, res) ->
            expect(res).to.be.an.Array
            expect(res).to.be.empty
            done err

  describe "with authentication", ->
    token = {}
    beforeEach (done) ->
      User.login {'email': 'user@example.com', 'password': "pass"}, (err, accessToken) ->
        token = accessToken.id
        done()
    describe "and a valid site ID", ->
      it "returns HTTP 200 if the user authorized"
      it "updates the site if the user is authorized"
      it "doesn't update the site if the user is unauthorized"
      it "updates only whitelisted fields"
      it "doesn't update non-whitelisted fields"
    describe "with an invalid site ID", ->
      it "returns HTTP 404"
