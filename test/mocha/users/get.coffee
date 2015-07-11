async = require 'async'
assert = require 'assert'
HTTP = require 'http-status-codes'
request = require 'supertest'

app = require '../../../server/server'
utils = require '../utils'
Divesite = app.models.Divesite
User = app.models.User

describe "GET /users", ->
  beforeEach utils.createUser
  afterEach utils.tearDown

  describe "without authentication", ->
    it "returns HTTP 401", (done) ->
      request app
        .get "/api/users"
        .expect HTTP.UNAUTHORIZED
        .end done
  describe "with authentication", ->
    token = {}
    beforeEach (done) ->
      User.login {email: 'user@example.com', password: 'pass'}, (err, accessToken) ->
        token = accessToken.id
        done err
    it "returns HTTP 401", (done) ->
      request app
        .get "/api/users"
        .expect HTTP.UNAUTHORIZED
        .end done

describe "GET /users/{id}", ->
  beforeEach utils.createUser
  afterEach utils.tearDown

  describe "without authentication", ->
    userId = {}
    beforeEach (done) ->
      User.findOne {where: {email: 'user@example.com'}}, (err, user) ->
        userId = user.id
        done err
    it "returns HTTP 200", (done) ->
      request app
        .get "/api/users/#{userId}"
        .expect HTTP.OK
        .end done

  describe "with authentication", ->
    userId = {}
    user2Id = {}
    token = {}
    beforeEach (done) -> User.create {email: 'user2@example.com', password: 'pass'}, (err, user) ->
      user2Id = user.id
      done err
    beforeEach (done) -> User.findOne {where: {email: 'user@example.com'}}, (err, user) ->
      userId = user.id
      done err
    beforeEach (done) -> User.login {email: 'user@example.com', password: 'pass'}, (err, accessToken) ->
      token = accessToken.id
      done err
    it "lets a user view their own profile", (done) ->
      request app
        .get "/api/users/#{userId}"
        .set "Authorization", token
        .expect HTTP.OK
        .end done
    it "lets a user view another user's profile", (done) ->
      request app
        .get "/api/users/#{user2Id}"
        .set "Authorization", token
        .expect HTTP.OK
        .end done
