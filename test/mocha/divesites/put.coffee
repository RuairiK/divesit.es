async = require 'async'
expect = require('chai').expect
HTTP = require('http-status-codes')
request = require('supertest')

utils = require '../utils'
app = require('../../../server/server')
Divesite = app.models.Divesite
User = app.models.User

describe "PUT /divesites/:id", ->

  before utils.tearDown
  after utils.tearDown

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
    it "doesn't update an existing divesite", (done) ->
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
    userId = {}
    beforeEach (done) ->
      User.login {'email': 'user@example.com', 'password': "pass"}, (err, accessToken) ->
        token = accessToken.id
        userId = accessToken.userId
        done err
    beforeEach (done) -> User.create {email: "owner@example.com", password: "pass"}, done

    describe "and a valid site ID", ->
      site = {}
      beforeEach (done) ->
        User.findOne {where: {email: "owner@example.com"}}, (err, user) ->
          Divesite.findOne {where: {name: "SITE_1"}}, (err, res) ->
            res.userId = user.id
            site = res
            res.save done
      
      describe "and authorization to update", ->

        beforeEach (done) ->
          User.login {email: "owner@example.com", password: "pass"}, (err, accessToken) ->
            token = accessToken.id
            userId = accessToken.id
            done err

        it "returns HTTP 200", (done) ->
          request app
            .put "/api/divesites/#{site.id}"
            .set "Authorization", token
            .send {name: "NEW_NAME"}
            .expect HTTP.OK
            .end done

        it "updates the site", (done) ->
          request app
            .put "/api/divesites/#{site.id}"
            .set "Authorization", token
            .send {name: "NEW_NAME"}
            .end (err, res) ->
              Divesite.find {where: {name: "NEW_NAME"}}, (err, res) ->
                expect(res).to.be.an.Array
                expect(res).to.have.length 1
                done err
        it "updates all whitelisted fields", (done) -> async.series [
          (cb) ->
            request app
              .put "/api/divesites/#{site.id}"
              .set "Authorization", token
              .send
                name: "NEW_NAME"
                depth: 20
                minimumLevel: 2
                boatEntry: false
                shoreEntry: true
                description: "NEW DESCRIPTION"
              .end cb
          (cb) ->
            Divesite.findById site.id, (err, res) ->
              expect(res.name).to.equal "NEW_NAME"
              expect(res.depth).to.equal 20
              expect(res.minimumLevel).to.equal 2
              expect(res.boatEntry).to.be.false
              expect(res.shoreEntry).to.be.true
              expect(res.description).to.equal "NEW DESCRIPTION"
              cb err
        ], done
        it "ignores non-whitelisted fields", (done) ->
          async.series [
            (cb) ->
              request app
                .put "/api/divesites/#{site.id}"
                .set "Authorization", token
                .send
                  userId: userId + 1
                  createdAt: Date.now()
                  updatedAt: Date.now()
                .end cb
            (cb) ->
              Divesite.findById site.id, (err, res) ->
                expect(res.userId).not.to.equal userId + 1
                expect(res.createdAt).to.equal site.createdAt
                expect(res.updatedAt).to.equal site.updatedAt
                cb err
          ], done

      describe "without authorization to update", (done) ->

        it "returns HTTP 401", (done) ->
          request app
            .put "/api/divesites/#{site.id}"
            .set "Authorization", token
            .send {name: "NEW_NAME"}
            .expect HTTP.UNAUTHORIZED, done

        it "doesn't update the site", (done) -> async.waterfall [
          (cb) -> User.create {email: 'user2@example.com', password: 'pass'}, cb
          (user2, cb) -> Divesite.findById site.id, (err, site) -> cb(err, user2, site)
          (user2, site, cb) ->
            site.userId = user2.id
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
