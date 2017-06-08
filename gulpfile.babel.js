'use strict';

import plugins  from 'gulp-load-plugins';
import yargs    from 'yargs';
import gulp     from 'gulp';
import rimraf   from 'rimraf';
import yaml     from 'js-yaml';
import fs       from 'fs';

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

// Load all Gulp plugins into one variable
const $ = plugins();

// Check for --production flag
// const PRODUCTION = !!(yargs.argv.production);

// Load settings from settings.yml
const { COMPATIBILITY, PATHS } = loadConfig();

function loadConfig() {
    let ymlFile = fs.readFileSync('config.yml', 'utf8');
    return yaml.load(ymlFile);
}

// Build the "dist" folder by running all of the below tasks
gulp.task('build',
    gulp.series(clean, gulp.parallel(sass, javascript, images, copy)));

// Build the site, run the server, and watch for file changes
gulp.task('default',
    gulp.series('build', watch));

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
    rimraf(PATHS.dist, done);
}

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
function copy() {
    return gulp.src(PATHS.assets)
        .pipe(gulp.dest(PATHS.dist));
}

// Compile Sass into CSS
// In production, the CSS is compressed
function sass() {
    return gulp.src('src/styles/main.scss')
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            includePaths: PATHS.sass
        })
            .on('error', $.sass.logError))
        .pipe($.autoprefixer({
            browsers: COMPATIBILITY
        }))
        .pipe($.if(PRODUCTION, $.cleanCss({ compatibility: 'ie9' })))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe(gulp.dest(PATHS.dist + '/styles'));
}

// Combine JavaScript into one file
// In production, the file is minified
function javascript() {
    return gulp.src(PATHS.javascript)
        .pipe($.sourcemaps.init())
        .pipe($.babel({ignore: ['html2canvas.js', 'quill.min.js']}))
        .pipe($.concat('app.js'))
        .pipe($.if(PRODUCTION, $.uglify()
            .on('error', e => { console.log(e); })
        ))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe(gulp.dest(PATHS.dist + '/scripts'));
}

// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
    return gulp.src('src/images/**/*')
        .pipe($.if(PRODUCTION, $.imagemin({
            progressive: true
        })))
        .pipe(gulp.dest(PATHS.dist + '/images'));
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
    gulp.watch(PATHS.assets, copy);
    gulp.watch('src/styles/**/*.scss').on('all', sass);
    gulp.watch('src/scripts/**/*.js').on('all', gulp.series(javascript));
    gulp.watch('src/images/**/*').on('all', gulp.series(images));
}
