var gulp = require('gulp');
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var ts = require('gulp-typescript');
var less = require('gulp-less');
var merge = require('merge2'); 
var manifest = require("gulp-manifest");
var rm = require('gulp-rimraf');
var path = require('path');
var webpack = require('webpack-stream');
var runSequence = require('run-sequence');

const BUILD_PATH = "build/";


function resolve() {
    return path.resolve(path.join.apply(path, arguments));
}


var typescriptProject = ts({
    noImplicitAny: false,
    removeComments: true,
    jsx: "react",
    target: "es5",
    lib: ["es6", "dom"],
    strictNullChecks: true,
    noImplicitAny: true,
    moduleResolution: "node",
    module: "commonjs",
    sourceMap: true,
    strict: true,
    "downlevelIteration": true
});


function buildTypescript(sources) {
    return gulp.src(sources)
        .pipe(typescriptProject)
        .pipe(gulp.dest(BUILD_PATH));
}


gulp.task('clean', [], () => 
    gulp.src([resolve(BUILD_PATH, "/**/*")]).pipe(rm())
);

gulp.task('tsc', [], () => {
    return buildTypescript([resolve('src/ts/**/*.ts'), resolve('src/ts/**/*.tsx')]);
})

gulp.task('build', ['tsc']);

gulp.task('default', (cb) => {
    runSequence('clean',
                'build',
                cb);
});



gulp.task('watch', [], cb => {
    runSequence('build', cb);
});
