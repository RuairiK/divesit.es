async = require 'async'
expect = require('chai').expect
request = require 'supertest'
faker = require 'faker'
HTTP = require 'http-status-codes'

app = require '../../../server/server'
utils = require '../utils'

Divesite = app.models.Divesite
Image = app.models.Image
User = app.models.User

describe "Retrieving images", ->

  req = {}
  sites = []
  user = {}
  user2 = {}

  createImage = (site, cb) -> Image.create {url: faker.image.image(), userId: user.id, divesiteId: site.id}, cb

  before (done) -> async.parallel [
    (cb) -> async.series [
      (next) -> utils.createSites next
      (next) -> Divesite.find (err, res) ->
        sites = res
        next err
    ], cb

    (cb) -> async.series [
      (next) -> utils.createUser next
      (next) -> User.findOne {where: {email: 'user@example.com'}}, (err, res) ->
        user = res
        next err
    ], cb

    (cb) -> async.series [
      (next) -> User.create {email: 'user2@example.com', password: 'pass'}, next
      (next) -> User.findOne {where: {email: 'user2@example.com'}}, (err, res) ->
        user2 = res
        next err
    ], cb

  ], done

  after utils.tearDown

  describe "GET /api/divesites/{id}/images", ->

    beforeEach -> req = request(app).get "/api/divesites/#{sites[0].id}/images"

    describe "when there are no images to retrieve", ->
      it "returns HTTP 200", (done) -> req.expect HTTP.OK, done
      it "returns JSON", (done) -> req.expect('Content-Type', /json/).end done
      it "returns an empty list", (done) ->
        req.end (err, res) ->
          expect(res.body).to.be.an.Array
          expect(res.body).to.be.empty
          done err

    describe "when there are Images to retrieve", ->
      beforeEach (done) -> async.each sites, createImage, done
      afterEach (done) -> Image.destroyAll done

      it "returns HTTP 200", (done) -> req.expect HTTP.OK, done
      it "returns JSON", (done) -> req.expect('Content-Type', /json/).end done
      it "returns a non-empty list", (done) ->
        req.end (err, res) ->
          expect(res.body).to.be.an.Array
          expect(res.body).not.to.be.empty
          expect(res.body).to.have.length 1
          done err
      it "returns only pertinent images", (done) ->
        req.end (err, res) ->
          res.body.forEach (image) -> expect(image.divesiteId).to.equal sites[0].id
          done err

  describe "GET /api/images", ->

    beforeEach ->
      req = request(app).get '/api/images'

    it "returns HTTP 200", (done) -> req.expect HTTP.OK, done

    it "returns JSON", (done) ->
      req.expect 'Content-Type', /json/
        .end done

    it "returns an empty list", (done) ->
      req.end (err, res) ->
        expect(res.body).to.be.an.Array
        expect(res.body).to.be.empty
        done err

    describe "when there are Images to retrieve", ->
      beforeEach (done) -> async.each sites, createImage, done
      afterEach (done) -> Image.destroyAll done

      it "returns HTTP 200", (done) ->
        req.expect HTTP.OK, done
      it "returns a non-empty list", (done) ->
        req.end (err, res) ->
          expect(res.body).to.be.an.Array
          expect(res.body).to.have.length 3
          done err
      it "returns JSON", (done) ->
        req
          .expect 'Content-Type', /json/
          .end done
