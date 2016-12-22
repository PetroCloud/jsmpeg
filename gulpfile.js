var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');
var pump = require('pump');

//script paths
var jsFiles = ['WebSocketClient.js', 'jsmpeglive.js'],
  jsDest = 'dist';

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

gulp.task('build', function (cb) {
  pump([
      gulp.src(jsFiles),
      eslint(),
      eslint.format(),
      eslint.failAfterError(),
      concat('jsmpeglive-bundle.js'),
      gulp.dest(jsDest),
      rename('jsmpeglive-bundle-min.js'),
      uglify(uglifyOpts),
      gulp.dest(jsDest)
    ],
    cb);
});


gulp.task('default', ['build'], function () {
});
