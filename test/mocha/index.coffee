process.env.NODE_ENV = 'test' 

async = require 'async'
assert = require('assert')
should = require('should')
mongoose = require('mongoose')
express = require('express')
HTTP = require('http-status-codes')
request = require('supertest')

routes = require('../../routes/index')
#Divesite = require('../../../models/Divesite')
#User = require('../../../models/User')
#Comment = require('../../../models/Comment')
app = require('../../app')

utils = require('./utils')

describe "GET /", ->
  it "returns HTTP 200 and HTML", (done) ->
    request app
      .get '/'
      .expect HTTP.OK
      .expect 'Content-Type', /text\/html/
      .end done
