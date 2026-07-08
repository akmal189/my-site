import gulp from 'gulp';

import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';

import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';

import svgSprite from 'gulp-svg-sprite';
import svgmin from 'gulp-svgmin';
import cheerio from 'gulp-cheerio';
import replace from 'gulp-replace';

import imagemin from 'gulp-imagemin';
import newer from 'gulp-newer';

import browserSyncPkg from 'browser-sync';

const { src, dest, watch, parallel, series } = gulp;

const sass = gulpSass(dartSass);
const browserSync = browserSyncPkg.create();

const paths = {
    scss: 'src/scss/**/*.scss',
    css: 'dist/css',

    scripts: 'src/scripts/**/*.js',
    scriptsDest: 'dist/scripts',

    svg: 'src/assets/svg/*.svg',
    sprite: 'dist/images',

    images: 'src/assets/images/*.{jpg,jpeg,png,gif,webp}',
    imagesDest: 'dist/images',

    video: 'src/assets/video/**/*.{mp4,webm,mov}',
    videoDest: 'dist/video',

    html: 'src/*.html'
};

// SCSS
function styles() {
    return src(paths.scss)
        .pipe(sourcemaps.init())
        .pipe(sass({
            loadPaths: ['src/scss/base']
        }).on('error', sass.logError))
        .pipe(
            autoprefixer({
                cascade: false
            })
        )
        .pipe(cleanCSS())
        .pipe(
            rename({
                suffix: '.min'
            })
        )
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.css))
        .pipe(browserSync.stream());
}

// JS (просто копирование, без минификации)
function scripts() {
    return src(paths.scripts)
        .pipe(newer(paths.scriptsDest))
        .pipe(dest(paths.scriptsDest))
        .pipe(browserSync.stream());
}

// SVG Sprite
function sprite() {
    return src(paths.svg)
        .pipe(
            svgSprite({
                shape: {
                    transform: [
                        {
                            svgo: {
                                plugins: [
                                    {
                                        name: 'preset-default',
                                        params: {
                                            overrides: {
                                                removeViewBox: false,
                                                removeDimensions: true,
                                                removeUselessStrokeAndFill: false
                                            }
                                        }
                                    },
                                    {
                                        name: 'removeAttrs',
                                        params: { attrs: ['data.*', 'fill'] }
                                    },
                                    {
                                        name: 'addAttributesToSVGElement',
                                        params: {
                                            attributes: [{ fill: 'currentColor' }]
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                },

                mode: {
                    symbol: {
                        sprite: '../sprite.svg'
                    }
                }
            })
        )
        .pipe(dest(paths.sprite))
        .pipe(browserSync.stream());
}

// Images
function images() {
    return src(paths.images, { encoding: false })
        .pipe(dest(paths.imagesDest));
}

// Video
function video() {
    return src(paths.video)
        .pipe(newer(paths.videoDest))
        .pipe(dest(paths.videoDest));
}

// HTML
function html() {
    return src(paths.html)
        .pipe(dest('dist'))
        .pipe(browserSync.stream());
}

// Server
function server() {
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    });

    watch(paths.scss, styles);
    watch(paths.scripts, series(scripts));
    watch(paths.svg, series(sprite)).on('change', browserSync.reload);
    watch(paths.images, series(images)).on('change', browserSync.reload);
    watch(paths.video, series(video)).on('change', browserSync.reload);
    watch(paths.html, html);
}

export {
    styles,
    scripts,
    sprite,
    images,
    video,
    html,
    server
};

export default series(
    parallel(styles, scripts, sprite, images, video, html),
    server
);
