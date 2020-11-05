const gulp = require("gulp");
const minify = require('gulp-minify');

const PluginError = require('plugin-error');
const log = require('fancy-log');
const webpack = require("webpack");
const del = require('del');
const argv = require('minimist')(process.argv.slice(2));

gulp.task("node_modules-webpack", (done) => {
    const config = require("./webpack.config.js");
    config.context = `${__dirname}`;
    config.mode = argv.mode ? argv.mode : 'production';
    return webpack(config, (err, stats) => {
        const statsJson = stats.toJson();
        if (err || (statsJson.errors && statsJson.errors.length)) {
            statsJson.errors.forEach(webpackError => {
                log.error(`Error (webpack): ${webpackError}`);
            });

            throw new PluginError('webpack', JSON.stringify(err || statsJson.errors));
        }
        log('[webpack]', stats.toString());
        done();
    });
});

gulp.task('compress', function(done) {
    gulp.src(['./src/**/*.js']).pipe(minify({ext: {min: '.js'}, noSource: true})).pipe(gulp.dest('out'));
    done();
  });

gulp.task("clean", (done) => {
    return del('out', done);
});

gulp.task("build", gulp.series("clean", "node_modules-webpack", 'compress'));
