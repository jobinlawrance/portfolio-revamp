// Gulp.js configuration
var
    // modules
    gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    newer = require('gulp-newer'),
    htmlclean = require('gulp-htmlclean'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    assets = require('postcss-assets'),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),
    cssnano = require('cssnano'),
    moduleImporter = require('sass-module-importer'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    revdel = require('gulp-rev-delete-original'),

    // development mode?
    devBuild = (process.env.NODE_ENV !== 'production'),

    // folders
    folder = {
        src: 'src/',
        build: 'build/'
    };

// image processing
gulp.task('images', function () {
    var out = folder.build + 'images/';

    return gulp.src(folder.src + 'images/**/*')
        .pipe(newer(out))
        .pipe(imagemin({ optimizationLevel: 5 }))
        .pipe(gulp.dest(out));
});

// HTML processing
gulp.task('html', function () {
    var out = folder.build;

    return gulp.src(folder.src + '*.html')
        .pipe(newer(out))
        // .pipe(htmlclean())
        .pipe(gulp.dest(out));
});

// CSS processing
gulp.task('css', ['images', 'html'], function () {

    var postCssOpts = [
        // assets({ loadPaths: ['images/'] }),
        autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
        mqpacker
    ];

    if (!devBuild) {
        postCssOpts.push(cssnano);
    }

    return gulp.src(folder.src + 'scss/main.scss')
        .pipe(sass({
            importer: moduleImporter(),
            outputStyle: 'nested',
            // imagePath: 'images/',
            precision: 3,
            errLogToConsole: true
        }))
        .pipe(postcss(postCssOpts))
        .pipe(gulp.dest(folder.build + 'css/'));

});

gulp.task('revision', ['css'], function () {
    return gulp.src([folder.build + "**/*.css"])
        .pipe(rev())
        .pipe(revdel())
        .pipe(gulp.dest(folder.build))
        .pipe(rev.manifest())
        .pipe(gulp.dest(folder.build))
});

gulp.task("revreplace", ['revision'], function () {
    var manifest = gulp.src("./" + folder.build + "/rev-manifest.json");

    return gulp.src(folder.build + "/index.html")
        .pipe(revReplace({ manifest: manifest }))
        .pipe(gulp.dest(folder.build));
});