var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');
var bower = require('gulp-bower');
var pump = require('pump');
var del = require('del');
var path = require('path');

//script paths
var jsFilesWebSocketClient = [
    'bower_components/eventemitter3/index.js',

    'src/WebSocketClient.js',
  ],
  jsFilesJsmpeglive = [
    'src/BitReader.js',
    'src/jsmpeglive.js'
  ],
  jsDestDist = 'dist',
  jsDestPublic = 'public';

var uglifyOpts = {
  mangle: true,
  compress: {
    sequences: true,  // join consecutive statemets with the “comma operator”
    properties: true,  // optimize property access: a["foo"] → a.foo
    dead_code: true,  // discard unreachable code
    drop_debugger: true,  // discard “debugger” statements
    unsafe: false, // some unsafe optimizations (see below)
    conditionals: true,  // optimize if-s and conditional expressions
    comparisons: true,  // optimize comparisons
    evaluate: true,  // evaluate constant expressions
    booleans: true,  // optimize boolean expressions
    loops: true,  // optimize loops
    unused: true,  // drop unused variables/functions
    hoist_funs: true,  // hoist function declarations
    hoist_vars: false, // hoist variable declarations
    if_return: true,  // optimize if-s followed by return/continue
    join_vars: true,  // join var declarations
    cascade: true,  // try to cascade `right` into `left` in sequences
    side_effects: true,  // drop side-effect-free statements
    warnings: true,  // warn about potentially dangerous optimizations/code
    global_defs: {}     // global definitions
  }
};

gulp.task('clean-dest', function () {
  del([jsDestDist, path.join(jsDestPublic, '*.js')]);
});

gulp.task('build-WebSocketClient', function (cb) {
  pump([
      bower(),
      gulp.src(jsFilesWebSocketClient),
      eslint(),
      eslint.format(),
      eslint.failAfterError(),
      concat('WebSocketClient.js'),
      gulp.dest(jsDestDist),
      gulp.dest(jsDestPublic),
      concat('WebSocketClient-min.js'),
      uglify(uglifyOpts),
      gulp.dest(jsDestDist)
    ],
    cb);
});

gulp.task('build-jsmpeglive', function (cb) {
  pump([
      gulp.src(jsFilesJsmpeglive),
      eslint(),
      eslint.format(),
      eslint.failAfterError(),
      concat('jsmpeglive-bundle.js'),
      gulp.dest(jsDestDist),
      gulp.dest(jsDestPublic),
      rename('jsmpeglive-bundle-min.js'),
      uglify(uglifyOpts),
      gulp.dest(jsDestDist)
    ],
    cb);
});


gulp.task('default', ['clean-dest', 'build-WebSocketClient', 'build-jsmpeglive'], function () {
});
