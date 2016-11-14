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

const BUILD_PATH = "build";
const DIST_PATH = "dist";


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
    sourceMap: true
});


function buildTypescript(sources) {
    return gulp.src(sources)
        .pipe(typescriptProject)
        .pipe(gulp.dest(BUILD_PATH));
}


gulp.task('tsc', [], () => {
    buildTypescript('src/**/*.ts');
})

gulp.task('bundle', [], () => {
    const entry = `${BUILD_PATH}/main.js`;
  
    return gulp.src(entry)
        .pipe(webpack({
            output: {
                filename: "main.js"
            }
        }))
        .pipe(gulp.dest(DIST_PATH));
})

gulp.task('default', ['tsc', 'bundle']);



gulp.task('watch', [], () => {
    gulp.watch('src/**/*.ts', (event) => {
        if (event.type === 'added' || event.type === 'changed') {
            buildTypescript([event.path]);
        }    
    });
});
