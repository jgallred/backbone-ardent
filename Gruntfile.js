module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= pkg.license %> */\n',
    // Task configuration.
    jshint: {
      all: [
        'Gruntfile.js',
        'src/**/*.js',
        'spec/**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    jasmine: {
      src: {
        src: 'src/*.js',
        options: {
          specs: 'spec/**/*.spec.js',
          //helpers: 'spec/*Helper.js'
          vendor: [
            'libs/jquery-1.10.1.js',
            'libs/json2.js',
            'libs/underscore.js',
            'libs/backbone-1.0.0.js',
            'node_modules/validatorjs/src/validator.js'
          ],
          keepRunner : true
        }
      },
      dist: {
        src: 'dist/<%= pkg.name %>.js',
        options: {
          specs: 'spec/**/*.spec.js',
          //helpers: 'spec/*Helper.js'
          vendor: [
            'libs/jquery-1.10.1.js',
            'libs/json2.js',
            'libs/underscore.js',
            'libs/backbone-1.0.0.js'
          ]
        }
      },
      distmin: {
        src: 'dist/<%= pkg.name %>.min.js',
        options: {
          specs: 'spec/**/*.spec.js',
          //helpers: 'spec/*Helper.js'
          vendor: [
            'libs/jquery-1.10.1.js',
            'libs/json2.js',
            'libs/underscore.js',
            'libs/backbone-1.0.0.js'
          ]
        }
      }
    },
    rig: {
      options: {
        banner: '<%= banner %>'
      },
      browser: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    }

  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-rigger');
  //grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint', /*'concat', 'uglify'*/]);

  grunt.registerTask('test', ['jshint', 'jasmine:src']);

  grunt.registerTask('deploy', ['rig', 'uglify', 'jasmine:dist', 'jasmine:distmin']);
};
