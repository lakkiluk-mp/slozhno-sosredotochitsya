const gulp = require('gulp');
const concat = require('gulp-concat-css');
const plumber = require('gulp-plumber');
const del = require('del');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mediaquery = require('postcss-combine-media-query');
const htmlMinify = require('html-minifier');
const uglify = require('gulp-uglify');
const modifyHTMLlinks = require('gulp-processhtml');
function serve() {
  browserSync.init({
    server: {
      baseDir: './dist',
    },
  });
}

function html() {
  const options = {
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
    collapseWhitespace: true,
    minifyCSS: true,
    keepClosingSlash: true,
  };

  return gulp
    .src('./index.html')
    .pipe(plumber())
    .pipe(modifyHTMLlinks())
    .on('data', function (file) {
      const buferFile = Buffer.from(
        htmlMinify.minify(file.contents.toString(), options)
      );
      return (file.contents = buferFile);
    })

    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({ stream: true }));
}

function css() {
  const plugins = [autoprefixer(), mediaquery()];
  return gulp
    .src('./{fonts,styles}/*.css')
    .pipe(plumber())
    .pipe(concat('bundle.css'))
    .pipe(postcss(plugins))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({ stream: true }));
}

function images() {
  return gulp
    .src('./images/*.{jpg,png,svg,gif,ico,webp,avif}')
    .pipe(gulp.dest('dist/images'))
    .pipe(browserSync.reload({ stream: true }));
}
function fonts() {
  return gulp
    .src('./fonts/*.woff')
    .pipe(gulp.dest('dist/fonts'))
    .pipe(browserSync.reload({ stream: true }));
}
function js() {
  return (
    gulp
      .src('./scripts/*.js')
      .pipe(uglify())
      // .pipe(concat('script.js'))
      .pipe(gulp.dest('dist/scripts'))
      .pipe(browserSync.reload({ stream: true }))
  );
}
function clean() {
  return del('dist');
}

function watchFiles() {
  gulp.watch(['./index.html'], html);
  gulp.watch(['./{fonts,styles}/*.css'], css);
  gulp.watch(['./fonts/*.woff'], fonts);
  gulp.watch(['./images/*.{jpg,png,svg,gif,ico,webp,avif}'], images);
  gulp.watch(['./scripts/*.js'], js);
}

const build = gulp.series(clean, gulp.parallel(css, images, fonts, js, html));
const watchapp = gulp.parallel(build, watchFiles, serve);

exports.css = css;
exports.images = images;
exports.fonts = fonts;
exports.js = js;
exports.html = html;
exports.clean = clean;

exports.build = build;
exports.watchapp = watchapp;
exports.default = watchapp;
