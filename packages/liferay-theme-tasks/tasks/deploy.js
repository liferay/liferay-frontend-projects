'use strict';

var _ = require('lodash');
var fs = require('fs-extra');
var lfrThemeConfig = require('../lib/liferay_theme_config');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var themeUtil = require('../lib/util');
var WarDeployer = require('../lib/war_deployer');

var argv = require('minimist')(process.argv.slice(2));

var livereload = plugins.livereload;

var themeConfig = lfrThemeConfig.getConfig(true);

module.exports = function(options) {
	var gulp = options.gulp;

	var store = gulp.storage;

	var pathBuild = options.pathBuild;

	var runSequence = require('run-sequence').use(gulp);

	gulp.task('deploy', function(cb) {
		var sequence = ['build', 'deploy:war', cb];

		if (argv.l || argv.live) {
			sequence.splice(1, 1, 'deploy-live:war');
		}

		runSequence.apply(this, sequence);
	});

	gulp.task('deploy:fast', function() {
		var dest = store.get('appServerPathTheme');

		var tempDirPath = path.join(dest, '../../temp/');

		var tempThemeDir;

		if (fs.existsSync(tempDirPath) && fs.statSync(tempDirPath).isDirectory()) {
			var themeName = store.get('themeName');

			var tempDir = fs.readdirSync(tempDirPath);

			tempThemeDir = _.find(tempDir, function(fileName) {
				return fileName.indexOf(themeName) > -1;
			});
		}

		var stream = gulp.src(themeUtil.getSrcPath(pathBuild + '/**/*', {
				changedFile: store.get('changedFile'),
				deployed: store.get('deployed')
			}))
			.pipe(gulp.dest(dest))
			.pipe(livereload());

		if (tempThemeDir) {
			stream.pipe(gulp.dest(path.join(tempDirPath, tempThemeDir)));
		}

		return stream;
	});

	gulp.task('deploy:war', function() {
		var gutil = plugins.util;

		var deployPath = store.get('deployPath');

		var stream = gulp.src('./dist/*.war')
			.pipe(gulp.dest(deployPath));

		gutil.log('Deploying to ' + gutil.colors.cyan(deployPath));

		if (!store.get('deployed')) {
			stream.on('end', function() {
				store.set('deployed', true);
			});
		}

		return stream;
	});

	gulp.task('deploy-live:war', function(cb) {
		var gutil = plugins.util;

		var password = argv.p || argv.password;
		var url = argv.url || store.get('url');
		var username = argv.u || argv.username;

		var themeName = themeConfig.name;

		var warDeployer = new WarDeployer({
			url: url,
			fileName: themeName,
			password: password,
			username: username
		}).on('end', cb);

		warDeployer.deploy();
	});
};