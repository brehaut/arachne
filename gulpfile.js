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
const DIST_PATH = "dist/";

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
    strict: true
});


function buildTypescript(sources) {
    return gulp.src(sources)
        .pipe(typescriptProject)
        .pipe(gulp.dest(BUILD_PATH));
}


gulp.task('clean', [], () => 
    gulp.src([resolve(BUILD_PATH, "/**/*"), resolve(DIST_PATH, "/**/*")]).pipe(rm())
);


gulp.task('tsc', [], () => {
    return buildTypescript([resolve('src/ts/**/*.ts'), resolve('src/ts/**/*.tsx')]);
})

gulp.task('less', function () {
  return gulp.src(resolve('src/less/style.less'))
    .pipe(less({
      paths: [ path.join(__dirname, 'src', 'less', 'includes') ]
    }))
    .pipe(gulp.dest(BUILD_PATH));
});

gulp.task('build', ['less', 'tsc']);


gulp.task('bundle', [], () => {
    const mainEntry = `${BUILD_PATH}/ui/main.js`;
    const workerEntry = `${BUILD_PATH}/workers/main.js`;

    function copy(src, dest) {
        return gulp.src(src).pipe(gulp.dest(dest));
    }

    function bundleScript(entry, dest) {
        return gulp.src(entry)
            .pipe(webpack({                
                output: {
                    filename: dest,                    
                }
            }))
            .pipe(gulp.dest(DIST_PATH))
    }

    return merge([
        bundleScript(mainEntry, "main.js"),
        bundleScript(workerEntry, "worker.js"),
        copy("src/html/index.html", DIST_PATH),
        copy(resolve(BUILD_PATH, "style.css"), DIST_PATH)
    ]);
})

gulp.task('default', (cb) => {
    runSequence('clean',
                'build',
                'bundle',
                cb);
});



gulp.task('watch', [], cb => {
    runSequence('build', 'bundle', cb);
});
