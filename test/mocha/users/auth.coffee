async = require 'async'
assert = require 'assert'
expect = require('chai').expect
HTTP = require 'http-status-codes'
request = require 'supertest'

app = require '../../../server/server'
utils = require '../utils'
Divesite = app.models.Divesite
User = app.models.User

describe "POST /api/users/login", ->
  beforeEach utils.createUser
  afterEach utils.tearDown

  describe "with email and password", ->
    it "returns HTTP 401 with the wrong password for an existing email", (done) ->
      request app
        .post "/api/users/login"
        .send {email: "user@example.com", password: "badpass"}
        .expect HTTP.UNAUTHORIZED
        .end done
    it "doesn't return an access token with the wrong password for an existing email", (done) ->
      request app
        .post "/api/users/login"
        .send {email: "user@example.com", password: "badpass"}
        .end (err, res) ->
          expect(res.body).not.to.have.property "id"
          expect(res.body).not.to.have.property "userId"
          done err
    it "returns HTTP 200 if the combination is valid", (done) ->
      request app
        .post "/api/users/login"
        .send {email: "user@example.com", password: "pass"}
        .expect HTTP.OK
        .end done
    it "returns an access token if the combination is valid", (done) ->
      request app
        .post "/api/users/login"
        .send {email: "user@example.com", password: "pass"}
        .end (err, res) ->
          done err
