const { src, dest, watch, parallel, series } = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
// const babel = require('gulp-babel');
// const uglify = require('gulp-uglify');
// const concat = require('gulp-concat');
const browserSync = require('browser-sync');
const clean = require('gulp-clean');
const svgSprite = require('gulp-svg-sprite');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const webp = require('gulp-webp');
// const fonter = require('gulp-fonter');
// const ttf2woff2 = require('gulp-ttf2woff2');

function html() {
  return src('src/pug/*.pug')
    .pipe(pug({ pretty: true }))
    .pipe(dest('docs'));
}

function styles() {
  return src('src/styles/*.scss')
  .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
  .pipe(autoprefixer())
  // .pipe(concat('main.min.css'))
  .pipe(dest('docs/styles'));
}

// function scripts() {
//   return src('src/scripts/*.js')
//     .pipe(babel({
//       presets: ['@babel/env']
//     }))
//     // .pipe(uglify())
//     .pipe(concat('main.js'))
//     // .pipe(concat('main.min.js'))
//     .pipe(dest('docs/scripts'));
// }

function server() {
  browserSync.init({
    server: {
      baseDir: './docs'
    },
    notify: false
  });
  browserSync.watch('docs', browserSync.reload);
}

function deleteBuild(cb) {
  return src([
    'docs/**/*.*', 
    '!docs/fonts/*.*',
    '!docs/images/*.*',
    '!docs/robots.txt',
    '!docs/favicon.png',
    // '!docs/js/jquery-3.7.1.min.js',
  ])
    .pipe(clean());
}

function watching() {
  watch('src/pug/**/*.pug', html);
  watch('src/styles/**/*.scss', styles);
  // watch('src/scripts/**/*.js', scripts);
  // watch('src/images/*.*', images);
}

function sprite() {
  return src('src/images/icons/*.svg')
    .pipe(svgSprite({
      // dest: 'docs/images',
      mode: {
        symbol: true,
        // view: true,
      }
    }))
    .pipe(dest('src/images/icons'));
}

function images() {
  return src('src/images/*.*')
    .pipe(newer('docs/images'))
    .pipe(webp())
    .pipe(src([
      'src/images/*.webp',
      'src/images/*.svg'
    ]))
    .pipe(newer('docs/images'))
    .pipe(imagemin())
    .pipe(dest('docs/images'));
}

// function fonts() {
//   return src('src/fonts/*.*')
//     .pipe(fonter({
//       formats: ['woff', 'ttf']
//     }))
//     .pipe(src('src/fonts/*.ttf'))
//     .pipe(ttf2woff2())
//     .pipe(dest('docs/fonts'));
// }

exports.sprite = sprite;
exports.images = images;
// exports.fonts = fonts;

exports.default = series(
  deleteBuild,
  parallel(html, styles),
  parallel(watching, server)
);
