'use strict';

var buildAmd = require('metal-tools-build-amd/lib/pipelines/buildAmd');
var compileSoy = require('metal-tools-soy/lib/pipelines/compileSoy');
var ConfigGenerator = require('liferay-module-config-generator/lib/config-generator');
var fs = require('fs-extra');
var gutil = require('gulp-util');
var path = require('path');

var chalk = gutil.colors;

var REGEX_PROVIDE_CAPABILITY = /(Provide-Capability=)(.*)/;

module.exports = function(gulp, options) {
	var runSequence = require('run-sequence').use(gulp);

	var pathBuild = options.pathBuild;
	var pathSrc = options.pathSrc;

	var metaInfPath = path.join(pathBuild, 'META-INF');

	var configGenerator = new ConfigGenerator({
		args: [path.join(pathBuild, 'js')],
		config: '',
		extension: '',
		filePattern: '**/*.es.js',
		format: ['/-/g', '_'],
		ignorePath: true,
		moduleConfig: path.join(process.cwd(), 'package.json'),
		moduleRoot: path.join(pathBuild),
		output: path.join(metaInfPath, 'config.json')
	});

	gulp.task('config:amd', function(done) {
		fs.ensureDirSync(metaInfPath);

		configGenerator.process().then(function() {
			done();
		});
	});

	gulp.task('provide-capability-property', function(done) {
		var filePath = path.join(pathBuild, 'WEB-INF', 'liferay-plugin-package.properties');

		fs.readFile(filePath, {
			encoding: 'utf8'
		}, function(err, result) {
			if (err) {
				throw err;
			}

			if (REGEX_PROVIDE_CAPABILITY.test(result)) {
				result = result.replace(
					REGEX_PROVIDE_CAPABILITY,
					'$1' + 'osgi.webresource;osgi.webresource=' + options.distName
				);

				gutil.log(
					chalk.yellow('Warning:'),
					chalk.cyan('Provide-Capability'),
					'property found in',
					chalk.cyan('liferay-plugin-package.properties'),
					'. This property is set automatically and should be removed.'
				);
			}
			else {
				result += '\nProvide-Capability=osgi.webresource;osgi.webresource=' + options.distName;
			}

			fs.writeFileSync(filePath, result);

			done();
		});
	});

	var metalOptions = {
		base: path.join(pathSrc, 'js'),
		buildAmdDest: path.join(pathBuild),
		moduleName: 'js'
	};

	gulp.task('metal:build:amd', ['metal:compile:soy'], function() {
		return gulp.src(path.join(pathSrc, 'js/**/*.es.js'), {
				base: process.cwd()
			})
			.pipe(buildAmd(metalOptions))
			.pipe(gulp.dest(metalOptions.buildAmdDest));
	});

	gulp.task('metal:compile:soy', function() {
		return gulp.src(path.join(pathSrc, '**/*.soy'))
			.pipe(compileSoy()).on('error', function(err) {
				gutil.log(err);
			})
			.pipe(gulp.dest(pathSrc));
	});

	gulp.hook('after:build:src', function(done) {
		runSequence(
			'metal:build:amd',
			'config:amd',
			'provide-capability-property',
			done
		);
	});

	gulp.hook('after:watch:setup', function(done) {
		var webBundlePath = gulp.storage.get('appServerPathPlugin');

		metalOptions.buildAmdDest = webBundlePath;
		metalOptions.cacheNamespace = false;

		configGenerator._options.args = [path.join(webBundlePath, 'js')];
		configGenerator._options.moduleRoot = path.join(webBundlePath);
		configGenerator._options.output = path.join(webBundlePath, 'META-INF', 'config.json');

		done();
	});

	gulp.hook('after:deploy:file', function(done) {
		var file = gulp.storage.get('changedFile');

		if (path.extname(file.path) === '.js') {
			runSequence('metal:build:amd', 'config:amd', done);
		}
		else {
			done();
		}
	});
};
