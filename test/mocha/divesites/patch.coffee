async = require 'async'
expect = require('chai').expect
HTTP = require('http-status-codes')
request = require('supertest')

utils = require '../utils'
app = require('../../../server/server')
Divesite = app.models.Divesite
User = app.models.User

describe "PATCH /divesites/:id", ->

  describe "without authentication", ->
    it "returns HTTP 401"
    it "doesn't patch an existing divesite"

  describe "with authentication", ->
    describe "with a valid site ID", ->
      it "updates the site if the user is authorized"
      it "doesn't update the site if the user is unauthorized"
      it "updates only whitelisted fields"
      it "doesn't update non-whitelisted fields"
    describe "with an invalid site ID", ->
      it "returns HTTP 404"
