'use strict';

var _ = require('lodash');
var fs = require('fs-extra');
var lfrThemeConfig = require('../lib/liferay_theme_config');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var themeUtil = require('../lib/util');
var WarDeployer = require('../lib/war_deployer');

var gutil = plugins.util;
var livereload = plugins.livereload;

var themeConfig = lfrThemeConfig.getConfig(true);

module.exports = function(options) {
	var gulp = options.gulp;

	var store = gulp.storage;

	var pathBuild = options.pathBuild;
	var pathSrc = options.pathSrc;

	var runSequence = require('run-sequence').use(gulp);

	var argv = options.argv;

	gulp.task('deploy', function(cb) {
		var sequence = ['build', 'deploy:war', cb];

		var webBundleDir = store.get('webBundleDir');

		if (argv.l || argv.live) {
			sequence.splice(1, 1, 'deploy-live:war');
		}
		else if (webBundleDir == 'watching') {
			sequence.splice(2, 0, 'watch:teardown');
		}

		runSequence.apply(this, sequence);
	});

	gulp.task('deploy:css-files', function() {
		var version = themeConfig.liferayTheme.version;

		var srcPath = path.join(pathBuild, 'css/*.css');

		var filePath = store.get('changedFile').path;

		if (version == '6.2' && !themeUtil.isSassPartial(filePath)) {
			var fileName = path.basename(filePath);

			srcPath = path.join(pathBuild, 'css', fileName);
		}

		return fastDeploy(srcPath, pathBuild);
	});

	gulp.task('deploy:file', function() {
		var changedFile = store.get('changedFile');

		return fastDeploy(changedFile.path, pathSrc);
	});

	gulp.task('deploy:folder', function() {
		var changedFile = store.get('changedFile');

		var relativeFilePath = path.relative(path.join(process.cwd(), pathSrc), changedFile.path);

		var match = relativeFilePath.match(/(.+?)\//);

		var rootDir = match ? match[1] : '';

		var fastDeployPaths = getFastDeployPaths();

		var srcRoot = rootDir == 'WEB-INF' ? pathBuild : pathSrc;

		return fastDeploy(path.join(srcRoot, rootDir, '**/*'), srcRoot);
	});

	gulp.task('deploy:war', function() {
		var deployPath = store.get('deployPath');

		var stream = gulp.src(options.pathDist + '/*.war')
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

	function fastDeploy(srcPath, basePath) {
		var fastDeployPaths = getFastDeployPaths();

		var stream = gulp.src(srcPath, {
				base: basePath
			})
			.pipe(plugins.debug())
			.pipe(gulp.dest(fastDeployPaths.dest));

		if (fastDeployPaths.tempDest) {
			stream.pipe(gulp.dest(fastDeployPaths.tempDest));
		}

		stream.pipe(livereload());

		return stream;
	}

	function getFastDeployPaths() {
		var fastDeployPaths = {
			dest: store.get('appServerPathTheme')
		};

		var tempDirPath = path.join(fastDeployPaths.dest, '../../temp/');

		var tempThemeDir;

		if (fs.existsSync(tempDirPath) && fs.statSync(tempDirPath).isDirectory()) {
			var themeName = store.get('themeName');

			var tempDir = fs.readdirSync(tempDirPath);

			tempThemeDir = _.find(tempDir, function(fileName) {
				return fileName.indexOf(themeName) > -1;
			});
		}

		fastDeployPaths.tempDest = tempThemeDir;

		return fastDeployPaths;
	}
};