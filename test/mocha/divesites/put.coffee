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
      site = {}
      beforeEach (done) ->
        User.findOne {where: {email: 'user@example.com'}}, (err, user) ->
          Divesite.findOne (err, res) ->
            res.userId = user.id # Assign ownership
            site = res
            res.save done
      it "returns HTTP 200 if the user is authorized", (done) ->
        request app
          .put "/api/divesites/#{site.id}"
          .set "Authorization", token
          .send {name: "NEW_NAME"}
          .expect HTTP.OK
          .end done
      it "updates the site if the user is authorized", (done) ->
        request app
          .put "/api/divesites/#{site.id}"
          .set "Authorization", token
          .send {name: "NEW_NAME"}
          .end (err, res) ->
            Divesite.find {where: {name: "NEW_NAME"}}, (err, res) ->
              expect(res).to.be.an.Array
              expect(res).to.have.length 1
              done err
      it "returns HTTP 401 if the user is unauthorized", (done) -> async.waterfall [
        (cb) -> User.create {email: 'user2@example.com', password: 'pass'}, cb # create a second user
        (user, cb) -> Divesite.findById site.id, (err, site) -> cb(err, user, site)
        (user, site, cb) ->
          site.userId = user.id # assign ownership to this other user
          site.save cb
        (site, cb) ->
          request app
            .put "/api/divesites/#{site.id}"
            .set "Authorization", token # authorize as the first user
            .send {name: "NEW_NAME"}
            .expect HTTP.UNAUTHORIZED # shouldn't be able to effect the change
            .end cb
      ], done
      it "doesn't update the site if the user is unauthorized", (done) -> async.waterfall [
        (cb) -> User.create {email: 'user2@example.com', password: 'pass'}, cb
        (user, cb) -> Divesite.findById site.id, (err, site) -> cb(err, user, site)
        (user, site, cb) ->
          site.userId = user.id
          site.save cb
        (site, cb) ->
          request app
            .put "/api/divesites/#{site.id}"
            .set "Authorization", token
            .send {name: "NEW_NAME"}
            .end (err, res) ->
              Divesite.find {where: {name: "NEW_NAME"}}, (err, res) ->
                expect(res).to.be.empty
                cb err
      ], done
      it "updates only whitelisted fields" # pending while we decide which fields are whitelisted
      it "doesn't update non-whitelisted fields" # pending while we decide which fields aren't whitelisted

    describe "with an invalid site ID", ->
      invalidId = {}
      beforeEach (done) -> Divesite.find (err, sites) ->
        ids = (site.id for site in sites)
        invalidId = ids.sort().reverse[0] + 1
        done err
      it "returns HTTP 404", (done) ->
        request app
          .put "/api/divesites/#{invalidId}"
          .set "Authorization", token
          .send {name: "NEW_NAME"}
          .expect HTTP.NOT_FOUND
          .end done
