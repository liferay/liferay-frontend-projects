'use strict';

var ConfigGenerator = require('liferay-module-config-generator/lib/config-generator');
var fs = require('fs-extra');
var gutil = require('gulp-util');
var metalAmd = require('gulp-metal/lib/tasks/amd');
var metalSoy = require('gulp-metal/lib/tasks/soy');
var path = require('path');

var chalk = gutil.colors;

var REGEX_PROVIDE_CAPABILITY = /(Provide-Capability=)(.*)/;

module.exports = function(gulp, options) {
	var runSequence = require('run-sequence').use(gulp);

	var pathBuild = options.pathBuild;
	var pathSrc = options.pathSrc;

	gulp.task('config:amd', function(done) {
		var metaInfPath = path.join(pathBuild, 'META-INF');

		fs.ensureDirSync(metaInfPath);

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
		buildSrc: path.join(pathSrc, 'js/**/*.es.js'),
		gulp: gulp,
		moduleName: 'js',
		taskPrefix: 'metal:'
	};

	metalAmd(metalOptions);
	metalSoy(metalOptions);

	gulp.hook('after:build:src', function(done) {
		runSequence(
			'metal:build:amd',
			'config:amd',
			'provide-capability-property',
			done
		);
	});

	gulp.hook('after:watch:setup', function(done) {
		metalOptions.buildAmdDest = gulp.storage.get('appServerPathPlugin');

		metalAmd(metalOptions);
		metalSoy(metalOptions);

		done();
	});

	gulp.hook('after:deploy:file', function(done) {
		var file = gulp.storage.get('changedFile');

		if (path.extname(file.path) === '.js') {
			runSequence('metal:build:amd', done);
		}
		else {
			done();
		}
	});
};
