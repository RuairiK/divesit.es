async = require 'async'

Divesite = require '../../models/Divesite'
User = require '../../models/User'
Comment = require '../../models/Comment'

USERNAME = 'TEST_USER'

tearDown = (done) -> async.parallel [
  (cb) -> User.find().remove cb
  (cb) -> Divesite.find().remove cb
  (cb) -> Comment.find().remove cb
], done


createUser = (done) -> User.create {
  displayName: USERNAME, picture: 'http://example.com/example.png'
}, done

createSite = (done) -> Divesite.create {
  name: "TEST_DIVESITE", category: "wreck", chart_depth: 100, loc: [0, 0]
}, done

createSiteAndUser = (done) -> async.parallel [
  (cb) -> createSite cb
  (cb) -> createUser cb
], done

createComment = (done) -> async.waterfall [
  (cb) -> Divesite.findOne cb
  (site, cb) -> User.findOne (e, user) -> cb(e, site, user)
  (site, user, cb) ->
    comment =
      divesite_id: site._id
      user: {_id: user._id, picture: user.picture, displayName: user.displayName}
      text: "blah blah blah"
    Comment.create comment, cb
], done

destroyAllComments = (done) -> Comment.find().remove done

module.exports =
  tearDown: tearDown
  createSite: createSite
  createUser: createUser
  createSiteAndUser: createSiteAndUser
  createComment: createComment
  destroyAllComments: destroyAllComments
  USERNAME: USERNAME
