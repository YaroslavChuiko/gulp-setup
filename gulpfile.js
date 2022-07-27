'use strict';

import browserSync, { reload } from 'browser-sync';
import gulp from 'gulp';
import prefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import cssmin from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import imagemin from 'gulp-imagemin';
import rigger from 'gulp-rigger'; //??
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import rimraf from 'rimraf';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);

let path = {
  dist: {
    //Тут мы укажем куда складывать готовые после сборки файлы
    html: 'dist/',
    js: 'dist/js/',
    css: 'dist/css/',
    img: 'dist/img/',
    fonts: 'dist/fonts/',
  },
  src: {
    //Пути откуда брать исходники
    html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
    js: 'src/js/main.js', //В стилях и скриптах нам понадобятся только main файлы
    css: 'src/style/main.scss',
    img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
    fonts: 'src/fonts/**/*.*',
  },
  watch: {
    //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
    html: 'src/**/*.html',
    js: 'src/js/**/*.js',
    css: 'src/style/**/*.scss',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*',
  },
  clean: './dist',
};

let config = {
  server: {
    baseDir: './dist',
  },
  notify: false,
  // tunnel: true,
  // host: "localhost",
  // port: 9000,
  // logPrefix: "Frontend_Devil"
};

function html() {
  return gulp
    .src(path.src.html) //Выберем файлы по нужному пути
    .pipe(rigger()) //Прогоним через rigger
    .pipe(
      htmlmin({
        collapseWhitespace: true, // удаляем все переносы
        removeComments: true, // удаляем все комментарии
      })
    )
    .pipe(gulp.dest(path.dist.html)) //Выплюнем их в папку dist
    .pipe(reload({ stream: true })); //И перезагрузим наш сервер для обновлений
}

function js() {
  return gulp
    .src(path.src.js) //Найдем наш main файл
    .pipe(rigger()) //Прогоним через rigger
    .pipe(sourcemaps.init()) //Инициализируем sourcemap
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(uglify()) //Сожмем наш js
    .pipe(sourcemaps.write()) //Пропишем карты
    .pipe(gulp.dest(path.dist.js)) //Выплюнем готовый файл в dist
    .pipe(reload({ stream: true })); //И перезагрузим сервер
}

function css() {
  return gulp
    .src(path.src.css) //Выберем наш main.scss
    .pipe(sourcemaps.init()) //То же самое что и с js
    .pipe(sass()) //Скомпилируем
    .pipe(prefixer()) //Добавим вендорные префиксы
    .pipe(cssmin()) //Сожмем
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.dist.css)) //И в dist
    .pipe(reload({ stream: true }));
}

function img() {
  return gulp
    .src(path.src.img) //Выберем наши картинки
    .pipe(
      imagemin({
        //Сожмем их
        optimizationLevel: 5,
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
      })
    )
    .pipe(gulp.dest(path.dist.img)) //И бросим в dist
    .pipe(reload({ stream: true }));
}

function fonts() {
  return gulp.src(path.src.fonts).pipe(gulp.dest(path.dist.fonts));
}

function watchFiles() {
  gulp.watch(path.watch.html, html);
  gulp.watch(path.watch.css, css);
  gulp.watch(path.watch.js, js);
  gulp.watch(path.watch.img, img);
  gulp.watch(path.watch.fonts, fonts);
}

function webserver() {
  return browserSync(config);
}

function clean(cb) {
  return rimraf(path.clean, cb);
}

const build = gulp.parallel(html, css, js, img, fonts);
const run = gulp.parallel(build, watchFiles, webserver);

export { html, js, css, img, fonts, clean, build, run as watch };

export default run;
