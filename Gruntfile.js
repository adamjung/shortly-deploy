module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['public/uglified/**/*.js'],
        dest: 'public/dist/compiled.js',
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      dynamic_mappings: {
        files: [
          {
            expand: true,
            cwd: 'public/',
            src: '**/*.js',
            dest: 'public/uglified/',
            ext: '.min.js',
            extDot: 'first'
          }
        ]
      }
    },

    eslint: {
      target: [
        'public/dist/compiled.js'
      ]
    },

    cssmin: {
      target: {
        files: {
          'public/uglified/output.css': ['public/style.css']
        }
      }
    },

    watch: {
      options: {
        livereload: true,
      },
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      remotePush: {
        command: 'git add . \n git commit -m \'whatevs \'\ngit push live master'
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    grunt.task.run([ 'nodemon', 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('startup', ['nodemon']);

  grunt.registerTask('build', ['uglify', 'concat']);

  grunt.registerTask('upload', function(n) {
    if (grunt.option('prod')) {
      // assume we have git remote live is setup
      // git push to the production droplet (bare folder or /var/repo/site.git)
      grunt.task.run(['shell']);
    } else {
      grunt.task.run(['server-dev']);
    }
  });

  grunt.registerTask('deploy', [
    'eslint',
    'test',
    'uglify',
    'concat',
    'cssmin'
  ]);

  grunt.registerTask('default', ['test', 'startup', 'deploy', 'cssmin']);
};
