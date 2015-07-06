module.exports = (grunt) ->
  (require 'load-grunt-tasks') grunt
  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    jshint: # lint .js files
      all:
        src: [
          'server/**/*.js'
          'common/**/*.js'
          'public/scripts/**/*.js'
        ]
      options:
        jshintrc: ".jshintrc"

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
          clearRequireCache: true
          timeout: 5000
        src: 'test/mocha/**/*.coffee'

    mocha_istanbul:
      coverage:
        src: 'test/mocha'

    watch:
      styles: # watch for LESS changes and compile
        files: ['public/less/*.less']
        tasks: ['less']
      karma:
        files: ['public/**/*.js']
        tasks: ['karma']

  grunt.loadNpmTasks 'grunt-env'
  grunt.registerTask 'js', ['jshint:all']
  grunt.registerTask 'build', ['js', 'less']
  grunt.registerTask 'test', [
    #'mochaTest'
    'karma'
    'mocha_istanbul:coverage'
  ]
  grunt.registerTask 'default', [
    'build',
    'test'
  ]
