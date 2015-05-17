module.exports = (grunt) ->
  (require 'load-grunt-tasks') grunt
  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    jshint: # lint .js files
      all:
        src: [
          'models/*.js'
          'routes/*.js'
          'public/scripts/**/*.js'
        ]
      options:
        asi: true # suppress semi-colon nonsense
        node: true # allow 'use strict' pragma
        globals:
          # Note that 'false' means 'defined but read-only'
          angular: false
          google: false
          $: false

    less: # Compile LESS files
      "public/styles/style.css": "public/less/style.less"

    ###
    # Test config
    ###

    karma:
      unit:
        configFile: 'karma.conf.js'
        singleRun: true
  
    mochaTest:
      test:
        options:
          require: 'coffee-script/register'
        src: 'test/mocha/**/*.coffee'

    mocha_istanbul:
      coverage:
        src: 'test/mocha'

    watch:
      styles: # watch for LESS changes and compile
        files: ['public/less/*.less']
        tasks: ['less']


  grunt.loadNpmTasks 'grunt-env'
  grunt.registerTask 'js', ['jshint:all']
  grunt.registerTask 'build', [
    'less'
  ]
  grunt.registerTask 'test', [
    'mochaTest'
    'karma'
    'mocha_istanbul:coverage'
  ]
  grunt.registerTask 'default', [
    'js'
    'test'
    'build'
  ]
