'use strict';

let _ = require('lodash');
let fs = require('fs-extra');
let path = require('path');
let plugins = require('gulp-load-plugins')();

let lfrThemeConfig = require('../lib/liferay_theme_config');
let themeUtil = require('../lib/util');
let WarDeployer = require('../lib/war_deployer');

let divert = require('../lib/divert');

let livereload = plugins.livereload;

let themeConfig = lfrThemeConfig.getConfig(true);

module.exports = function(options) {
	const {argv, gulp, pathBuild, pathSrc} = options;
	const {storage} = gulp;

	const runSequence = require('run-sequence').use(gulp);

	gulp.task('deploy', function(cb) {
		let sequence = ['build', 'deploy:war', cb];

		let webBundleDir = storage.get('webBundleDir');

		if (argv.l || argv.live) {
			sequence.splice(1, 1, 'deploy-live:war');
		} else if (webBundleDir === 'watching') {
			sequence.splice(2, 0, 'watch:teardown');
		}

		runSequence.apply(this, sequence);
	});

	gulp.task('deploy:css-files', () => {
		const srcPath = path.join(pathBuild, 'css/*.css');
		const filePath = storage.get('changedFile').path;

		return fastDeploy(srcPath, pathBuild);
	});

	gulp.task('deploy:file', function() {
		let changedFile = storage.get('changedFile');

		return fastDeploy(changedFile.path, pathSrc);
	});

	gulp.task('deploy:folder', function() {
		let changedFile = storage.get('changedFile');

		let relativeFilePath = path.relative(
			path.join(process.cwd(), pathSrc),
			changedFile.path
		);

		let filePathArray = relativeFilePath.split(path.sep);

		let rootDir = filePathArray.length ? filePathArray[0] : '';

		return fastDeploy(path.join(pathBuild, rootDir, '**/*'), pathBuild);
	});

	gulp.task('deploy:gogo', function(cb) {
		let sequence = ['build', 'plugin:deploy-gogo', cb];

		let webBundleDir = storage.get('webBundleDir');

		if (webBundleDir === 'watching') {
			sequence.splice(2, 0, 'watch:teardown');
		}

		runSequence.apply(this, sequence);
	});

	gulp.task('deploy:war', ['plugin:deploy']);

	gulp.task('deploy-live:war', function(cb) {
		let password = argv.p || argv.password;
		let url = argv.url || storage.get('url');
		let username = argv.u || argv.username;

		let themeName = themeConfig.name;

		let warDeployer = new WarDeployer({
			fileName: themeName,
			password: password,
			url: url,
			username: username,
		}).on('end', cb);

		warDeployer.deploy();
	});

	function fastDeploy(srcPath, basePath) {
		let fastDeployPaths = getFastDeployPaths();

		let stream = gulp
			.src(srcPath, {
				base: basePath,
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
		let fastDeployPaths = {
			dest: storage.get('appServerPathPlugin'),
		};

		let tempDirPath = path.join(fastDeployPaths.dest, '../../temp/');

		let tempThemeDir;

		if (
			fs.existsSync(tempDirPath) &&
			fs.statSync(tempDirPath).isDirectory()
		) {
			let themeName = storage.get('themeName');

			let tempDir = fs.readdirSync(tempDirPath);

			tempThemeDir = _.find(tempDir, function(fileName) {
				return fileName.indexOf(themeName) > -1;
			});
		}

		fastDeployPaths.tempDest = tempThemeDir;

		return fastDeployPaths;
	}
};
